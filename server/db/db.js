import mongoose from "mongoose";
import { MONGODB_URL } from "../config/env.js";
import { DB_NAME } from "../constants.js";

if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined in environment variables");
}

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${MONGODB_URL}/${DB_NAME}`);
        console.log("Database connected successfully:", connectionInstance.connection.host);
    } catch (error) {
        console.log("Database connection error:", error);
        throw new Error("Database connection failed");
    }
}

export default connectDB;