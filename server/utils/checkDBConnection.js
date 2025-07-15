import mongoose from "mongoose";
import connectDB from "../db/db.js";

const checkDBConnection = async () => {
    if (mongoose.connection.readyState !== 1) {
		await connectDB();
	}
}

export default checkDBConnection;