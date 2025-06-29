import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

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