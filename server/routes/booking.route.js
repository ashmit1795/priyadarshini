import { Router } from "express";
import { completeBooking, createBooking, getOccupiedSeats, verifyPayment } from "../controllers/booking.controller.js";

const bookingRouter = Router();

bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.get("/verify-payment/:bookingId", verifyPayment);
bookingRouter.post("/complete-booking/:bookingId", completeBooking);

export default bookingRouter;