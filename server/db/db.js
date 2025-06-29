import mongoose from "mongoose";
import { MONGODB_URL } from "../config/env.js";
import { DB_NAME } from "../constants.js";
import debug from "debug";

const dbDebug = debug("server:database:mongodb");

if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined in environment variables");
}

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${MONGODB_URL}/${DB_NAME}`);
        dbDebug("Database connected successfully:", connectionInstance.connection.host);
    } catch (error) {
        dbDebug("Database connection error:", error);
        throw new Error("Database connection failed");
    }
}

export default connectDB;