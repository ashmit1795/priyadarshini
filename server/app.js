import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/show.route.js";
import bookingRouter from "./routes/booking.route.js";
import adminRouter from "./routes/admin.route.js";
import userRouter from "./routes/user.route.js";
import movieRouter from "./routes/movie.route.js";
import contactRouter from "./routes/contact.route.js";

export const app = express();

// Middlewares

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for handling cookies
app.use(cookieParser());

// CORS configuration
app.use(cors());

// Clerk middleware for authentication
app.use(clerkMiddleware());

// Endpoints
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/movie", movieRouter);
app.use("/api/contact", contactRouter);

// '/' route to check if the server is running
app.get("/", (req, res) => {
	res.send({
		title: "Priyadarshini API",
		description: "API for Priyadarshini, a movie ticket booking application.",
		version: "1.0.0",
	});
});