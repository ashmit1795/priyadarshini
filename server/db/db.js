// import mongoose from "mongoose";
// import { MONGODB_URL } from "../config/env.js";
// import { DB_NAME } from "../constants.js";

// if (!MONGODB_URL) {
//     throw new Error("MONGODB_URL is not defined in environment variables");
// }

// const connectDB = async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${MONGODB_URL}/${DB_NAME}`);
//         console.log("Database connected successfully:", connectionInstance.connection.host);
//     } catch (error) {
//         console.log("Database connection error:", error);
//         throw new Error("Database connection failed");
//     }
// }

// export default connectDB;

import mongoose from "mongoose";
import { MONGODB_URL } from "../config/env.js";

const MONGO_URI = MONGODB_URL; // put the FULL URI here 💡
console.log(MONGO_URI)

if (!MONGO_URI) {
	throw new Error("❌  MONGODB_URL is not defined in environment variables");
}

/**
 * Because Vercel functions are stateless, we memo‑cache the connection
 * across invocations (kept alive by the lambda runtime).
 */
let cached = global._mongooseCachedConn;

if (!cached) {
	cached = { conn: null, promise: null };
	global._mongooseCachedConn = cached;
}

export default async function connectDB() {
	if (cached.conn) {
		// ✅ Already connected – reuse the existing connection
		return cached.conn;
	}

	if (!cached.promise) {
		// First time: create the promise and store it
		cached.promise = mongoose
			.connect(MONGO_URI, {
				// these options remove deprecation warnings
				useNewUrlParser: true,
				useUnifiedTopology: true,
				// extra safety/time‑outs
				serverSelectionTimeoutMS: 10000, // 10 s ‑ matches error
				socketTimeoutMS: 20000,
				maxPoolSize: 10,
			})
			.then((mongooseInstance) => {
				if (process.env.NODE_ENV !== "production") {
					console.log("✅ MongoDB connected:", mongooseInstance.connection.host);
				}
				return mongooseInstance;
			})
			.catch((err) => {
				console.error("❌ MongoDB connection failed:", err.message);
				throw err;
			});
	}

	cached.conn = await cached.promise;
	return cached.conn;
}
