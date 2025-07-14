import User from "../models/user.model.js";
import { CASHFREE_APP_ID, CASHFREE_SECRET_KEY, SERVER_URL } from "../config/env.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import { Cashfree, CFEnvironment } from "cashfree-pg"; 
import { inngest } from "../inngest/index.js";

const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;

        // Check if the selected seats are available
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
        if (!isAvailable) {
            return res.status(400).json({ success: false, error: "Selected seats are not available." });
        }

        // Get the show details
        const show = await Show.findById(showId).populate("movie");

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: show.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats,
        });

        selectedSeats.map((seat) => {
            // Mark the seat as occupied in the show
            show.occupiedSeats[seat] = userId;
        });

        show.markModified("occupiedSeats"); // Mark the field as modified
        await show.save();

        // Cashfree Gateway Integration
        console.log("Starting Cashfree payment process...");
        
        const response = await initiateCashfreePayment(booking._id, userId, origin);

        // Run inngest scheduler function to check payment status after 10 minutes
        await inngest.send({
            name: "app/checkpayment",
            data: {
                bookingId: booking._id.toString()
            }
        });

        if (response.success) {
            return res.status(201).json({ success: true, sessionId: response.sessionId });
        } else {
            return res.status(500).json({ success: false, message: response.message });
        }

    } catch (error) {
        console.error("Error creating booking:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const show = await Show.findById(showId);

        const occupiedSeats = Object.keys(show.occupiedSeats);

        return res.status(200).json({ success: true, occupiedSeats });
    } catch (error) {
        console.error("Error getting occupied seats:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}

const verifyPayment = async (req, res) => { 
    try {
		const { bookingId } = req.params;
		const cashfree = new Cashfree(CFEnvironment.SANDBOX, CASHFREE_APP_ID, CASHFREE_SECRET_KEY);

        console.log("Verifying payment for booking ID:", bookingId);
        const { data } = await cashfree.PGOrderFetchPayments(bookingId);
		if (data && data.length > 0) {
			if (data[0].payment_status === "SUCCESS") {
				const booking = await Booking.findById(bookingId);
				booking.isPaid = true;
                booking.paymentLink = null;
                booking.generateQrToken();
                await booking.save();

                const { data: orderData } = await cashfree.PGFetchOrder(bookingId);
                const { origin } = orderData.order_tags;

                // Send confirmation email
                await inngest.send({
                    name: "app/show.booked",
                    data: {
                        bookingId
                    }
                });
                

                return res.redirect(`${origin}/loading/my-bookings`);
            } else {
                const { data: orderData } = await cashfree.PGFetchOrder(bookingId);
                const { origin } = orderData.order_tags;

                // Inngest event to notify that payment is pending
                await inngest.send({
                    name: "app/payment.pending",
                    data: {
                        bookingId
                    }
				});

                return res.redirect(`${origin}/my-bookings`);
            }
        } else {
			const { data: orderData } = await cashfree.PGFetchOrder(bookingId);
			const { origin } = orderData.order_tags;

			// Inngest event to notify that payment is pending
			await inngest.send({
				name: "app/payment.pending",
				data: {
					bookingId,
				},
			});

			return res.redirect(`${origin}/my-bookings`);
		}
	} catch (error) {
		console.error("Error verifying payment:", error);
		return res.status(500).json({ success: false, message: error.message });
	}
    
}

const completeBooking = async (req, res) => {
    try {
        const cashfree = new Cashfree(CFEnvironment.SANDBOX, CASHFREE_APP_ID, CASHFREE_SECRET_KEY);
		// Step 1: Fetch order details
		const orderResponse = await cashfree.PGFetchOrder(req.params.bookingId);
		const orderData = orderResponse.data;

		// Step 2: Check if order is active
		if (orderData.order_status !== "ACTIVE") {
			throw new Error(`Order is not active. Status: ${orderData.order_status}`);
		}

		// Check if order is not expired
		if (new Date() > new Date(orderData.order_expiry_time)) {
			throw new Error("Order has expired");
		}

		// Step 3: Use the payment_session_id for payment
		const paymentSessionId = orderData.payment_session_id;
		if (paymentSessionId) {
			return res.status(201).json({ success: true, sessionId: paymentSessionId });
		} else {
			return res.status(500).json({ success: false, message: "Failed to create payment session" });
		}
	} catch (error) {
        console.error("Error completing booking:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const verifyBooking = async (req, res) => {
    try {
        const { token } = req.params;
        const booking = await Booking.findOne({ qrToken: token, isPaid: true }).populate({
            path: "show",
            populate: {
                path: "movie",
            },
        }).populate("user");

        if (!booking) {
            return res.json({ success: false, message: "Booking not found or not paid" });
        }

        if(booking.checkedIn) {
            return res.json({ success: false, message: "Ticket already used" });
        }

        const now = new Date();
        const showStartTime = new Date(booking.show.showDateTime);
        const showEndTime = new Date(showStartTime.getTime() + booking.show.movie.runtime * 60000);
        const validFrom = new Date(showStartTime.getTime() - 60 * 60000); // 1 hour before showtime

        if(now < validFrom) {
            return res.json({ success: false, message: "Ticket is not valid at this time" });
        }

        if(now > showEndTime) {
            return res.json({ success: false, message: "Ticket is expired" });
        }

        booking.checkedIn = true;
        await booking.save();

        const data = {
            bookingId: booking._id,
            user: booking.user.name,
            movie: booking.show.movie.title,
            showTime: booking.show.showDateTime,
        }

        return res.status(200).json({ success: true, message: "Booking verified successfully", data });
    } catch (error) {
        console.error("Error verifying booking:", error.message);
        res.status(500).json({ success: false, message: error.message });
        
    }
}

export { createBooking, getOccupiedSeats, verifyPayment, completeBooking, verifyBooking };

// Utility function to check seat availability
const checkSeatsAvailability = async (showId, selectedSeats) => {
    // selectedSeats is an array of seat identifiers (e.g., ["A1", "A2"])
    try {
        const show = await Show.findById(showId);
        if (!show) return false;

        const occupiedSeats = show.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        console.error("Error checking seat availability:", error.message);
        return false;
    }
}

// Utility function to initiate cashfree payment
const initiateCashfreePayment = async (bookingId, userId, origin) => {
	try {
		const booking = await Booking.findById(bookingId).populate("show");
        const show = await Show.findById(booking.show).populate("movie");
        const user = await User.findById(userId);
        
		const cashfree = new Cashfree(CFEnvironment.SANDBOX, CASHFREE_APP_ID, CASHFREE_SECRET_KEY);

		const date30MinLater = new Date(Date.now() + 30 * 60 * 1000);
		const isoString = date30MinLater.toISOString();
		const order_expiry_time = isoString.split(".")[0] + "Z";

		let request = {
			order_amount: booking.amount,
			order_currency: "INR",
			order_id: booking._id.toString(),
			order_note: "Booking for show: " + show.movie.title,
			customer_details: {
                customer_id: userId.toString(),
                customer_name: user.name,
                customer_email: user.email,
				customer_phone: user.phone,
			},
			order_expiry_time,
			order_meta: {
				return_url: `${SERVER_URL}/booking/verify-payment/${booking._id}`,
			},
			order_tags: {
				origin: origin, // Store the origin of the request
				bookingId: booking._id.toString(),
			},
		};

		const { data } = await cashfree.PGCreateOrder(request);

		booking.paymentLink = data.payment_session_id;
        await booking.save();

        return { success: true, sessionId: data.payment_session_id };
	} catch (error) {
		console.error("Error initiating cashfree payment:", error);
		return { success: false, message: error.message };
	}
};