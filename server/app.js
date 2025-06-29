import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

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

app.use("/api/inngest", serve({ client: inngest, functions }));