import { config } from "dotenv";

config({
    path: `.env`
})

export const { MONGODB_URL, PORT, TMDB_API_KEY } = process.env;