import express from "express";
import cookieParser from "cookie-parser"

export const app = express();

// Middlewares

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for handling cookies
app.use(cookieParser());