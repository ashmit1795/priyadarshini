import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import User from "../models/user.model.js";
import checkDBConnection from "../utils/checkDBConnection.js";

// API endpoint to check if a user is an admin
const isAdmin = async (req, res) => { 
    res.json({ success: true, isAdmin: true });
}

// API endpoint to get dashboard data
const getDashboardData = async (req, res) => {
    try {
        await checkDBConnection();
        const bookings = await Booking.find({ isPaid: true });
        const activeShows = await Show.find({ showDateTime: { $gte: new Date() } }).populate("movie");
        const totalUsers = await User.countDocuments() - 1; // Exclude the admin user

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((total, booking) => total + booking.amount, 0),
            activeShows,
            totalUsers
        };

        res.json({ success: true, dashboardData });
    } catch (error) {
        console.error("Error getting dashboard data:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API endpoint to get all the upcoming shows
const getAllShows = async (req, res) => {
    try {
        await checkDBConnection();
        const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate("movie").sort({ showDateTime: 1 });
        res.json({ success: true, shows });
    } catch (error) {
        console.error("Error getting all shows:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API endpoint to get all past shows
const getAllPastShows = async (req, res) => {
    try {
        await checkDBConnection();
        const shows = await Show.find({ showDateTime: { $lt: new Date() } }).populate("movie").sort({ showDateTime: -1 });
        res.json({ success: true, shows });
    } catch (error) {
        console.error("Error getting all past shows:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API endpoint to get all bookings
const getAllBookings = async (req, res) => {
    try {
        await checkDBConnection();
        const bookings = await Booking.find().populate("user").populate({
            path: "show",
            populate: {
                path: "movie"
            }
        }).sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.error("Error getting all bookings:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

export { isAdmin, getDashboardData, getAllShows, getAllBookings, getAllPastShows };
