import { Inngest } from "inngest";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import mongoose from "mongoose";
import connectDB from "../db/db.js";
import sendEmail from "../config/nodemailer.js";
import { LOGO_URL, WEBSITE_URL } from "../config/env.js";
import Movie from "../models/movie.model.js";

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
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        <title>Booking Confirmation</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #0b1d34; color: #ffffff;">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: auto; background-color: #112240; border-radius: 8px; overflow: hidden;">
                            <tr>
                                <td style="padding: 20px; text-align: center; background-color: #0b1d34;">
                                    <img src=${LOGO_URL} alt="Priyadarshini Logo" width="200" style="margin-bottom: 10px;" />
                                    <h3 style="margin: 0; color: #ff3c3c;">Booking Confirmed 🎉</h3>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 25px; background-color: #112240;">
                                    <p style="font-size: 16px;">Hi <strong>${booking.user.name}</strong> 👋,</p>
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
                                        <tr>
                                            <td style="padding: 8px; color: #aaa;">💺 Seats</td>
                                            <td style="padding: 8px;">
                                                ${booking.bookedSeats.join(", ")}
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="font-size: 15px; margin-bottom: 20px;">We hope you enjoy your show! 🍿</p>

                                    <p style="font-size: 14px; color: #aaa;">Thank you for booking with us. <br/> – Team <span style="color: #ff3c3c;"><a href=${WEBSITE_URL}>Priyadarshini</a></span></p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #0b1d34; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                                    &copy; 2025 Priyadarshini. All rights reserved.
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
        `;

		await sendEmail({
			to: booking.user.email,
			subject: `🎬 Booking Confirmed: Enjoy ${booking.show.movie.title} at Priyadarshini!`,
            body: emailTemplate,
            fromAlias: "+bookings"
		});
	}
);

// Inngest Function to send reminders
const sendReminders = inngest.createFunction(
    {
        id: "send-show-reminders"
    },
    {
        cron: "0 */8 * * *" // Execute in every 8 hours
    },
    async ({ step }) => {
        const now = new Date();
        const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

        // Prepare reminder tasks
        const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
            const shows = await Show.find({
                showDateTime: {
                    $gte: windowStart,
                    $lte: in8Hours
                }
            }).populate("movie");

            const tasks = [];

            for (const show of shows) {
                if (!show.movie || !show.occupiedSeats) continue;

                const userIds = [...new Set(Object.values(show.occupiedSeats))];

                if (userIds.length === 0) continue;

                const users = await User.find({
                    _id: {
                        $in: userIds
                    }
                }).select("name email");

                for (const user of users) {
                    tasks.push({
                        userEmail: user.email,
                        userName: user.name,
                        movieTitle: show.movie.title,
                        showTime: show.showDateTime
                    })
                }
            }

            return tasks;
        });

        if (reminderTasks.length === 0) {
            return {
                sent: 0,
                message: "No reminders to send."
            }
        }

        const reminderEmailTemplate = ({ userName, movieTitle, showTime, websiteUrl, logoUrl }) => `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Show Reminder - Priyadarshini</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #001f3f; color: #ffffff;">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: auto; background-color: #112240; border-radius: 8px; overflow: hidden;">
                            <tr>
                                <td style="padding: 20px; text-align: center; background-color: #001f3f;">
                                    <img src="${logoUrl}" alt="Priyadarshini Logo" width="200" style="margin-bottom: 10px;" />
                                    <h3 style="margin: 0; color: #f30e0e;">Upcoming Show Reminder 🎬</h3>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 25px;">
                                    <p style="font-size: 16px;">Hi <strong>${userName}</strong>,</p>
                                    <p style="font-size: 15px; line-height: 1.6;">
                                        Just a friendly reminder that your show <strong>${movieTitle}</strong> is scheduled soon. Here's your showtime:
                                    </p>
                                    <table style="margin: 20px 0; width: 100%; font-size: 15px; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px; color: #aaa;">📅 Date</td>
                                            <td style="padding: 8px;">
                                                ${new Date(showTime).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; color: #aaa;">⏰ Time</td>
                                            <td style="padding: 8px;">
                                                ${new Date(showTime).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" })}
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="font-size: 15px;">Please arrive 15 minutes early to avoid last-minute hassles.</p>
                                    <a href="${websiteUrl}/my-bookings" style="display: inline-block; margin-top: 20px; padding: 12px 25px; background-color: #f30e0e; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: 600;">View Your Bookings</a>
                                    <p style="font-size: 14px; color: #aaa; margin-top: 30px;">Thanks for choosing <span style="color: #f30e0e;">Priyadarshini</span>. 🍿<br/> We hope you have a fantastic experience!</p>
                                </td>
                            </tr>

                            <tr>
                                <td style="background-color: #001f3f; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                                    &copy; 2025 Priyadarshini. All rights reserved.
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>`;


        // Send reminder emails
        const results = await step.run("send-all-reminders", async () => {
            return await Promise.allSettled(
                reminderTasks.map(task => sendEmail({
                    to: task.userEmail,
                    subject: `🎬 Reminder: Your show ${task.movieTitle} is starting soon!`,
                    body: reminderEmailTemplate({
                        userName: task.userName,
                        movieTitle: task.movieTitle,
                        showTime: task.showTime,
                        websiteUrl: WEBSITE_URL,
                        logoUrl: LOGO_URL
                    }),
                    fromAlias: "+shows"
                }))
            );
        });

        const sent = results.filter(r => r.status === "fulfilled").length;
        const failed = results.length - sent;

        return {
            sent,
            failed,
            message: `Sent ${sent} reminder(s), ${failed} failed`
        }
    }
);

// Inngest Function to send notifications on adding new show
const sendNewShowNotifications = inngest.createFunction(
    {
        id: "send-new-show-notification"
    },
    {
        event: "app/show.added"
    },
    async ({ event, step }) => {
        
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        
        const { movieId } = event.data;

        const users = await User.find({});
        const movie = await Movie.findById(movieId);
        const movieTitle = movie.title;

        const newShowEmailTemplate = ({ userName, movieTitle, movieId, posterUrl, description, websiteUrl, logoUrl }) => `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>New Show Added - Priyadarshini</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #001f3f; color: #ffffff;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: auto; background-color: #112240; border-radius: 10px; overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 20px; text-align: center; background-color: #001f3f;">
                                <img src="${logoUrl}" alt="Priyadarshini Logo" width="200" style="margin-bottom: 10px;" />
                                <h3 style="margin: 0; color: #f30e0e;">🎉 A New Show Just Dropped!</h3>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 25px;">
                                <p style="font-size: 16px;">Hi <strong>${userName}</strong> 👋,</p>
                                <p style="font-size: 15px; line-height: 1.6;">
                                    We’ve just added a brand-new show for <strong>${movieTitle}</strong> and you might not want to miss it!
                                </p>

                                <!-- Poster -->
                                <div style="text-align: center; margin: 20px 0;">
                                    <img src="${posterUrl}" alt="${movieTitle} Poster" style="max-width: 100%; border-radius: 8px;" />
                                </div>

                                <!-- Movie Title -->
                                <table style="margin-top: 10px; width: 100%; font-size: 15px; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px; color: #aaa;">🎬 Movie</td>
                                        <td style="padding: 8px;">${movieTitle}</td>
                                    </tr>
                                </table>

                                <!-- Description -->
                                <p style="font-size: 14px; line-height: 1.5; margin-top: 20px; color: #ddd;">
                                    ${description}
                                </p>

                                <!-- CTA -->
                                <a href="${websiteUrl}/movies/${movieId}" style="display: inline-block; margin-top: 25px; padding: 14px 30px; background-color: #f30e0e; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: bold; text-align: center;">🎟️ Book Now</a>

                                <p style="font-size: 14px; color: #aaa; margin-top: 30px;">See you at the movies!<br><span style="color: #f30e0e;">– Team Priyadarshini 🍿</span></p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #001f3f; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                                &copy; 2025 Priyadarshini. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </body>
            </html>
        `;


        for (const user of users) {
            const userEmail = user.email;
            const userName = user.name;
            const subject = `🎬 Just In: New Show Added for ${movieTitle} – Book Now!`;

            await sendEmail({
				to: userEmail,
				subject,
				body: newShowEmailTemplate({
					userName,
					movieTitle,
					movieId,
					posterUrl: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
					description: movie.overview,
					websiteUrl: WEBSITE_URL,
					logoUrl: LOGO_URL,
                }),
                fromAlias: "+shows"
			});
        }

        return {
            message: "Notifications sent."
        }
    }
);

// Inngest Function to send payment pending email
const sendPaymentPendingEmail = inngest.createFunction(
    {
        id: "send-payment-pending-email"
    },
    {
        event: "app/payment.pending"
    },
    async ({ event, step }) => {
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
        
        const paymentPendingTemplate = ({ userName, movieTitle, bookedSeats, showDate, showTime, bookingId, websiteUrl, logoUrl }) => `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Complete Your Payment - Priyadarshini</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #001f3f; color: #ffffff;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: auto; background-color: #112240; border-radius: 10px; overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 20px; text-align: center; background-color: #001f3f;">
                                <img src="${logoUrl}" alt="Priyadarshini Logo" width="200" style="margin-bottom: 10px;" />
                                <h2 style="margin: 0; color: #f30e0e;">⏳ Payment Pending!</h2>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 25px;">
                                <p style="font-size: 16px;">Hi <strong>${userName}</strong>,</p>
                                <p style="font-size: 15px; line-height: 1.6;">
                                    You’ve selected <strong>${movieTitle}</strong> and your seats <strong>(${bookedSeats.join(", ")})</strong> are reserved.
                                </p>

                                <p style="font-size: 15px; margin-top: 10px; line-height: 1.6;">
                                    ⚠️ Please complete your payment within <strong>10 minutes</strong> to confirm the booking.
                                    If payment isn’t made within the time, your seats will be released and the booking will be automatically cancelled.
                                </p>

                                <table style="margin: 20px 0; width: 100%; font-size: 15px; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px; color: #aaa;">🎬 Movie</td>
                                        <td style="padding: 8px;">${movieTitle}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; color: #aaa;">📅 Date</td>
                                        <td style="padding: 8px;">${showDate}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; color: #aaa;">⏰ Time</td>
                                        <td style="padding: 8px;">${showTime}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; color: #aaa;">💺 Seats</td>
                                        <td style="padding: 8px;">${bookedSeats.join(", ")}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; color: #aaa;">🆔 Booking ID</td>
                                        <td style="padding: 8px;">${bookingId}</td>
                                    </tr>
                                </table>

                                <a href="${websiteUrl}/my-bookings" style="display: inline-block; margin-top: 25px; padding: 14px 30px; background-color: #f30e0e; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: bold; text-align: center;">💳 Complete Payment</a>

                                <p style="font-size: 14px; color: #aaa; margin-top: 30px;">Need help? Reach out to our support. <br><span style="color: #f30e0e;">– Team Priyadarshini 🎬</span></p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #001f3f; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                                &copy; 2025 Priyadarshini. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </body>
            </html>
        `;

        await sendEmail({
            to: booking.user.email,
            subject: `⏳ Payment Pending for Your Booking - ${booking.show.movie.title}`,
            body: paymentPendingTemplate({
                userName: booking.user.name,
                movieTitle: booking.show.movie.title,
                showDate: booking.show.showDateTime.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" }),
                showTime: booking.show.showDateTime.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit' }),
                bookedSeats: booking.bookedSeats,
                bookingId: booking._id,
                websiteUrl: WEBSITE_URL,
                logoUrl: LOGO_URL
            }),
            fromAlias: "+bookings"
        });
    }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
	syncUserCreation,
	syncUserDeletion,
	syncUserUpdation,
	releaseSeatsAndDeleteBooking,
	sendBookingConfirmationMail,
	sendReminders,
    sendNewShowNotifications,
    sendPaymentPendingEmail
];
