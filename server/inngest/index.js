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

		await sendEmail({
			to: booking.user.email,
			subject: `🎬 Booking Confirmed: Enjoy ${booking.show.movie.title} at Priyadarshini!`,
			body: `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        <title>Booking Confirmation</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #0b1d34; color: #ffffff;">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: auto; background-color: #112240; border-radius: 8px; overflow: hidden;">
                            <tr>
                                <td style="padding: 20px; text-align: center; background-color: #0b1d34;">
                                    <img src="https://i.ibb.co/BH8VgC8r/priyadarshini-high-resolution-logo-transparent.png" alt="Priyadarshini Logo" width="120" style="margin-bottom: 10px;" />
                                    <h4 style="margin: 0; color: #ff3c3c;">Booking Confirmed 🎉</h4>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 25px; background-color: #112240;">
                                    <p style="font-size: 16px;">Hi <strong>${booking.user.name}</strong>👋,</p>
                                    <p style="font-size: 15px; line-height: 1.6;">
                                        Your booking for <strong>${booking.show.movie.title}</strong> has been confirmed!
                                    </p>

                                    <table style="margin: 20px 0; width: 100%; font-size: 15px; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px; color: #aaa;">🎬 Movie</td>
                                            <td style="padding: 8px;">${booking.show.movie.title}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; color: #aaa;">📅 Date</td>
                                            <td style="padding: 8px;">
                                                ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; color: #aaa;">⏰ Time</td>
                                            <td style="padding: 8px;">
                                                ${new Date(booking.show.showDateTime).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" })}
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="font-size: 15px; margin-bottom: 20px;">We hope you enjoy your show! 🍿</p>

                                    <p style="font-size: 14px; color: #aaa;">Thank you for booking with us. <br/> – Team <span style="color: #ff3c3c;">Priyadarshini</span></p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #0b1d34; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                                    &copy; Priyadarshini. All rights reserved.
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
            `,
		});
	}
);

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationMail];
