import { config } from "dotenv";

config({
    path: `.env`
})

export const {
	MONGODB_URL,
	PORT,
	TMDB_API_KEY,
	CASHFREE_APP_ID,
	CASHFREE_SECRET_KEY,
	SERVER_URL,
	SENDER_EMAIL,
	SMTP_USER,
	SMTP_PASS,
	WEBSITE_URL,
	LOGO_URL,
} = process.env;