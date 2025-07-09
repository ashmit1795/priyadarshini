import { Inngest } from "inngest";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import mongoose from "mongoose";
import connectDB from "../db/db.js";
import sendEmail from "../config/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest(
    {
        id: "movie-ticket-booking"
    }
);

// Inngest function to save user data to the database
const syncUserCreation = inngest.createFunction(
	{
		id: "sync-user-from-clerk",
	},
	{
		event: "clerk/user.created",
	},
    async ({ event }) => {
		// Ensure database connection is active
		if (mongoose.connection.readyState !== 1) {
			await connectDB();
		}
		const { id, first_name, last_name, email_addresses, image_url, phone_numbers } = event.data;
		const userData = {
			_id: id,
			name: `${first_name} ${last_name}`,
			email: email_addresses[0].email_address,
			image: image_url,
			phone: phone_numbers[0].phone_number,
		};

		await User.create(userData);
	}
);

// Inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
	{
		id: "delete-user-with-clerk",
	},
	{
		event: "clerk/user.deleted",
	},
    async ({ event }) => {
		// Ensure database connection is active
		if (mongoose.connection.readyState !== 1) {
			await connectDB();
		}
		const { id } = event.data;
		await User.findByIdAndDelete(id);
	}
);

// Inngest function to update user data in the database
const syncUserUpdation = inngest.createFunction(
	{
		id: "update-user-with-clerk",
	},
	{
		event: "clerk/user.updated",
	},
    async ({ event }) => {
		// Ensure database connection is active
		if (mongoose.connection.readyState !== 1) {
			await connectDB();
		}
		const { id, first_name, last_name, email_addresses, image_url, phone_numbers } = event.data;
		const userData = {
			_id: id,
			name: `${first_name} ${last_name}`,
			email: email_addresses[0].email_address,
			image: image_url,
			phone: phone_numbers[0].phone_number,
		};
		await User.findByIdAndUpdate(id, userData);
	}
);

// Inngest function to cancel booking and release seats of show after 10 minutes of booking created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
	{
		id: "release-seats-deleted-booking",
	},
	{
		event: "app/checkpayment",
	},
	async ({ event, step }) => {
		const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
		await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

		await step.run("check-payment-status", async () => {
			// Ensure database connection is active
			if (mongoose.connection.readyState !== 1) {
				await connectDB();
			}
			const bookingId = event.data.bookingId;
			const booking = await Booking.findById(bookingId);

			// If payment is not made, release the seats and delete the booking
			if (!booking.isPaid) {
				const show = await Show.findById(booking.show);
				booking.bookedSeats.forEach((bookedSeat) => {
					delete show.occupiedSeats[bookedSeat];
				});
				show.markModified("occupiedSeats");
				await show.save();
				await Booking.findByIdAndDelete(booking._id);
			}
		});
	}
);

// Inngest Function to send email when user books a show
const sendBookingConfirmationMail = inngest.createFunction(
	{
		id: "send-booking-confirmation-email",
	},
	{
		event: "app/show.booked",
	},
    async ({ event, step }) => {
		// Ensure database connection is active
		if (mongoose.connection.readyState !== 1) {
			await connectDB();
        }
        
		const bookingId = event.data.bookingId;

		const booking = await Booking.findById(bookingId)
			.populate({
				path: "show",
				populate: {
					path: "movie",
					model: "Movie",
				},
			})
            .populate("user");
        
        const emailTemplate = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Booking Confirmation - Priyadarshini</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 20px;
                            min-height: 100vh;
                        }
                        
                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 20px;
                            overflow: hidden;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        }
                        
                        .header {
                            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                            padding: 30px;
                            text-align: center;
                            position: relative;
                            overflow: hidden;
                        }
                        
                        .header::before {
                            content: '';
                            position: absolute;
                            top: -50%;
                            left: -50%;
                            width: 200%;
                            height: 200%;
                            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
                            animation: float 20s linear infinite;
                        }
                        
                        @keyframes float {
                            0% { transform: translateX(-50px) translateY(-50px); }
                            100% { transform: translateX(50px) translateY(50px); }
                        }
                        
                        .logo {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                            margin-bottom: 10px;
                            position: relative;
                            z-index: 1;
                        }
                        
                        .logo-icon {
                            width: 40px;
                            height: 40px;
                            background: #e74c3c;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 20px;
                            color: white;
                            font-weight: bold;
                        }
                        
                        .logo-text {
                            font-size: 24px;
                            font-weight: 700;
                            color: white;
                            letter-spacing: 1px;
                        }
                        
                        .header-title {
                            color: white;
                            font-size: 18px;
                            font-weight: 300;
                            margin-top: 10px;
                            position: relative;
                            z-index: 1;
                        }
                        
                        .content {
                            padding: 40px 30px;
                        }
                        
                        .greeting {
                            font-size: 24px;
                            font-weight: 600;
                            color: #2c3e50;
                            margin-bottom: 20px;
                        }
                        
                        .message {
                            font-size: 16px;
                            color: #555;
                            line-height: 1.6;
                            margin-bottom: 30px;
                        }
                        
                        .booking-card {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 15px;
                            padding: 25px;
                            margin: 30px 0;
                            color: white;
                            position: relative;
                            overflow: hidden;
                        }
                        
                        .booking-card::before {
                            content: '';
                            position: absolute;
                            top: -2px;
                            left: -2px;
                            right: -2px;
                            bottom: -2px;
                            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
                            border-radius: 15px;
                            z-index: -1;
                            animation: rainbow 3s linear infinite;
                        }
                        
                        @keyframes rainbow {
                            0% { filter: hue-rotate(0deg); }
                            100% { filter: hue-rotate(360deg); }
                        }
                        
                        .movie-title {
                            font-size: 28px;
                            font-weight: 700;
                            margin-bottom: 20px;
                            text-align: center;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        }
                        
                        .booking-details {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            margin-top: 20px;
                        }
                        
                        .detail-item {
                            text-align: center;
                            padding: 15px;
                            background: rgba(255,255,255,0.1);
                            border-radius: 10px;
                            backdrop-filter: blur(10px);
                        }
                        
                        .detail-label {
                            font-size: 12px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            opacity: 0.8;
                            margin-bottom: 5px;
                        }
                        
                        .detail-value {
                            font-size: 18px;
                            font-weight: 600;
                        }
                        
                        .ticket-section {
                            background: #f8f9fa;
                            border-radius: 15px;
                            padding: 20px;
                            margin: 20px 0;
                            border: 2px dashed #e9ecef;
                            position: relative;
                        }
                        
                        .ticket-section::before,
                        .ticket-section::after {
                            content: '';
                            position: absolute;
                            width: 20px;
                            height: 20px;
                            background: white;
                            border-radius: 50%;
                            top: 50%;
                            transform: translateY(-50%);
                        }
                        
                        .ticket-section::before {
                            left: -10px;
                        }
                        
                        .ticket-section::after {
                            right: -10px;
                        }
                        
                        .ticket-info {
                            text-align: center;
                            color: #6c757d;
                        }
                        
                        .cta-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 15px 30px;
                            border-radius: 25px;
                            text-decoration: none;
                            font-weight: 600;
                            margin: 20px auto;
                            display: block;
                            text-align: center;
                            transition: all 0.3s ease;
                            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
                        }
                        
                        .cta-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                        }
                        
                        .footer {
                            background: #2c3e50;
                            color: white;
                            text-align: center;
                            padding: 30px;
                        }
                        
                        .footer-message {
                            font-size: 18px;
                            margin-bottom: 15px;
                        }
                        
                        .footer-signature {
                            font-size: 14px;
                            opacity: 0.8;
                        }
                        
                        .social-links {
                            margin: 20px 0;
                        }
                        
                        .social-links a {
                            display: inline-block;
                            width: 40px;
                            height: 40px;
                            background: rgba(255,255,255,0.1);
                            border-radius: 50%;
                            margin: 0 10px;
                            text-decoration: none;
                            color: white;
                            line-height: 40px;
                            transition: all 0.3s ease;
                        }
                        
                        .social-links a:hover {
                            background: rgba(255,255,255,0.2);
                            transform: translateY(-2px);
                        }
                        
                        @media (max-width: 600px) {
                            .booking-details {
                                grid-template-columns: 1fr;
                            }
                            
                            .content {
                                padding: 20px;
                            }
                            
                            .movie-title {
                                font-size: 24px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <!-- Header -->
                        <div class="header">
                            <div class="logo">
                                <div class="logo-icon">🎬</div>
                                <div class="logo-text">Priyadarshini</div>
                            </div>
                            <div class="header-title">Payment Confirmation</div>
                        </div>
                        
                        <!-- Main Content -->
                        <div class="content">
                            <div class="greeting">Hi {{USER_NAME}}! 🎉</div>
                            
                            <div class="message">
                                Great news! Your booking has been confirmed and payment processed successfully. Get ready for an amazing movie experience!
                            </div>
                            
                            <!-- Booking Card -->
                            <div class="booking-card">
                                <div class="movie-title">{{MOVIE_TITLE}}</div>
                                
                                <div class="booking-details">
                                    <div class="detail-item">
                                        <div class="detail-label">📅 Date</div>
                                        <div class="detail-value">{{SHOW_DATE}}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">⏰ Time</div>
                                        <div class="detail-value">{{SHOW_TIME}}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">🎫 Booking ID</div>
                                        <div class="detail-value">{{BOOKING_ID}}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">💺 Seats</div>
                                        <div class="detail-value">{{SEAT_NUMBERS}}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Ticket Section -->
                            <div class="ticket-section">
                                <div class="ticket-info">
                                    <strong>🎟️ Your Digital Ticket</strong><br>
                                    <small>Show this confirmation at the theater entrance</small>
                                </div>
                            </div>
                            
                            <div class="message">
                                <strong>Important Reminders:</strong><br>
                                • Please arrive 15 minutes before showtime<br>
                                • Carry a valid ID for verification<br>
                                • Outside food and beverages are not permitted<br>
                                • Enjoy the show! 🍿
                            </div>
                            
                            <a href="#" class="cta-button">View Full Booking Details</a>
                        </div>
                        
                        <!-- Footer -->
                        <div class="footer">
                            <div class="footer-message">🎬 Enjoy the Show! 🎬</div>
                            
                            <div class="social-links">
                                <a href="#">📧</a>
                                <a href="#">📱</a>
                                <a href="#">🌐</a>
                            </div>
                            
                            <div class="footer-signature">
                                Thanks for booking with us!<br>
                                <strong>- Team Priyadarshini</strong>
                            </div>
                        </div>
                    </div>
                </body>
            </html>`;

		await sendEmail({
			to: booking.user.email,
			subject: `🎬 Booking Confirmed: Enjoy ${booking.show.movie.title} at Priyadarshini!`,
			body: emailTemplate
				.replace("{{USER_NAME}}", booking.user.name)
				.replace("{{MOVIE_TITLE}}", booking.show.movie.title)
				.replace("{{SHOW_DATE}}", new Date(booking.show.showDateTime).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" }))
				.replace("{{SHOW_TIME}}", new Date(booking.show.showDateTime).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" }))
				.replace("{{BOOKING_ID}}", booking._id)
				.replace("{{SEAT_NUMBERS}}", booking.bookedSeats.join(", ")),
		});
	}
);

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationMail];
