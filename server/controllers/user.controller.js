import { clerkClient } from "@clerk/express";
import Booking from "../models/booking.model.js";
import Movie from "../models/movie.model.js";
import User from "../models/user.model.js";
import checkDBConnection from "../utils/checkDBConnection.js";

// API endpoint to get user bookings
const getUserBookings = async (req, res) => { 
    try {
        await checkDBConnection();
        const userId = req.auth().userId;

        const bookings = await Booking.find({ user: userId })
            .populate({
                path: "show",
                populate: {
                    path: "movie",
                }
            }).sort({ createdAt: -1 });
        
        res.json({ success: true, bookings });
    } catch (error) {
        console.error("Error fetching user bookings:", error.message);
        res.json({ success: false, message: error.message });

    }
}

const getUser = async (req, res) => {
    try {
        await checkDBConnection();
        const userId = req.auth().userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// API endpoint to update favorite movie in clerk user metadata
const updateFavoriteMovie = async (req, res) => { 
    try {
        await checkDBConnection();
        const { movieId } = req.body;
        const userId = req.auth().userId;

        const user = await clerkClient.users.getUser(userId);
        if(!user.privateMetadata.favoriteMovies) {
            user.privateMetadata.favoriteMovies = [];
        }

        let message;
        if(!user.privateMetadata.favoriteMovies.includes(movieId)) {
            user.privateMetadata.favoriteMovies.push(movieId);
            message = "Added to favorites successfully."
        } else {
            user.privateMetadata.favoriteMovies = user.privateMetadata.favoriteMovies.filter(id => id !== movieId);
            message = "Removed from favorites successfully.";
        }
        
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: user.privateMetadata
        });

        res.json({ success: true, message });
    } catch (error) {
        console.error("Error updating favorite movie:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// API endpoint to get favorite movies of a user
const getFavoriteMovies = async (req, res) => { 
    try {
        await checkDBConnection();
        const userId = req.auth().userId;
        const user = await clerkClient.users.getUser(userId);
        const favoriteMovies = user.privateMetadata.favoriteMovies || [];

        // Fetch movie details from the database
        const movies = await Movie.find({ _id: { $in: favoriteMovies } });
        res.json({ success: true, favoriteMovies: movies });
    } catch (error) {
        console.error("Error fetching favorite movies:", error.message);
        res.json({ success: false, message: error.message });
    }
}

export { getUserBookings, updateFavoriteMovie, getFavoriteMovies, getUser };