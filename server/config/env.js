import { config } from "dotenv";

config({
    path: `.env`
})

export const { MONGODB_URL, PORT, TMDB_API_KEY, CASHFREE_APP_ID, CASHFREE_SECRET_KEY, SERVER_URL } = process.env;