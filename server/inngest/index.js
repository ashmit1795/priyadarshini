
import { Inngest } from "inngest";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import mongoose from "mongoose";
import connectDB from "../db/db.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest function to save user data to the database
const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-from-clerk",
    },
    {
        event: "clerk/user.created",
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url, phone_numbers } = event.data;
        const userData = {
            _id: id,
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            image: image_url,
            phone: phone_numbers[0].phone_number
        };

        await User.create(userData);
    }
);

// Inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
    {
        id: "delete-user-with-clerk"
    },
    {
        event: "clerk/user.deleted"
    },
    async ({ event }) => {
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
        const { id, first_name, last_name, email_addresses, image_url, phone_numbers } = event.data;
        const userData = {
			_id: id,
			name: `${first_name} ${last_name}`,
			email: email_addresses[0].email_address,
            image: image_url,
            phone: phone_numbers[0].phone_number
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
		})
    }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking
];
