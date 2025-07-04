import { clerkClient } from "@clerk/express";
import Booking from "../models/booking.model.js";
import { use } from "react";
import Movie from "../models/movie.model.js";

// API endpoint to get user bookings
const getUserBookings = async (req, res) => { 
    try {
        const userId = req.auth().userId;

        const bookings = await Booking.find({ user: userId })
            .populate({
                path: "show",
                populate: {
                    path: "movie",
                }
            }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error("Error fetching user bookings:", error.message);
        res.status(500).json({ success: false, error: error.message });
        
    }
}

// API endpoint to update favorite movie in clerk user metadata
const updateFavoriteMovie = async (req, res) => { 
    try {
        const { movieId } = req.body;
        const userId = req.auth().userId;

        const user = await clerkClient.users.getUser(userId);
        if(!user.privateMetadata.favoriteMovies) {
            user.privateMetadata.favoriteMovies = [];
        }

        if(!user.privateMetadata.favoriteMovies.includes(movieId)) {
            user.privateMetadata.favoriteMovies.push(movieId);
        } else {
            user.privateMetadata.favoriteMovies = user.privateMetadata.favoriteMovies.filter(id => id !== movieId);
        }
        
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: user.privateMetadata
        });

        res.status(200).json({ success: true, message: "Favorite movie updated successfully." });
    } catch (error) {
        console.error("Error updating favorite movie:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
}

// API endpoint to get favorite movies of a user
const getFavoriteMovies = async (req, res) => { 
    try {
        const userId = req.auth().userId;
        const user = await clerkClient.users.getUser(userId);
        const favoriteMovies = user.privateMetadata.favoriteMovies || [];

        // Fetch movie details from the database
        const movies = await Movie.find({ _id: { $in: favoriteMovies } });
        res.status(200).json({ success: true, favoriteMovies: movies });
    } catch (error) {
        console.error("Error fetching favorite movies:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
}

export { getUserBookings, updateFavoriteMovie, getFavoriteMovies };