import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        default: "9999999999", // Default phone number
    },
    image: {
        type: String,
        required: true,
    },
});

const User = mongoose.model("User", userSchema);

export default User;