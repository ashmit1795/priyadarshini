import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
	{
		show: { type: String, ref: "Show", required: true },
		user: { type: String, ref: "User", required: true },
		amount: { type: Number, required: true },
		bookedSeats: { type: Array, required: true },
		isPaid: { type: Boolean, default: false },
		paymentLink: { type: String, default: null },
		qrToken: { type: String, unique: true, index: true },
		checkedIn: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

bookingSchema.methods.generateQrToken = function () { 
    this.qrToken = crypto.randomUUID();
}

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
