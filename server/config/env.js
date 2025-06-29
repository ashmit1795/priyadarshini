import { config } from "dotenv";

config({
    path: `.env`
})

export const { MONGODB_URL, PORT } = process.env;