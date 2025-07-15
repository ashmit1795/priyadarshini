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
	EMAIL_APP_PASSWORD,
	WEBSITE_URL,
	LOGO_URL,
	SMTP_PASS,
} = process.env;