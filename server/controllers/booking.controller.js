import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";

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

        // Stripe Gateway Integration
        console.log("Starting Stripe payment process...");

        return res.status(201).json({ success: true, message: "Booking created successfully." });
    } catch (error) {
        console.error("Error creating booking:", error.message);
        return res.status(500).json({ success: false, error: error.message });
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

export { createBooking, getOccupiedSeats };

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