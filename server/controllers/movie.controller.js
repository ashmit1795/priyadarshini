import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";

// API endpoint to get all movies from the database
const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json({ success: true, movies });
    } catch (error) {
        console.error("Error fetching movies:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API endpoint to get all movies with trailers
// This endpoint is used to fetch trailers for shows that are scheduled in the future
const getAllMoviesTrailers = async (req, res) => {
    try {
        // Get only those trailers of those shows which are at future date
        const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate("movie");
        const seenTitles = new Set();
        const uniqueTrailers = [];

        for (const show of shows) {
            const title = show.movie.title;
            if (!seenTitles.has(title)) {
                seenTitles.add(title);
                uniqueTrailers.push({
                    _id: show.movie._id,
                    title: show.movie.title,
                    trailer: show.movie.trailer
                });
            }
        }

        res.json({ success: true, trailers: uniqueTrailers });
    } catch (error) {
        console.error("Error fetching trailers:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { getAllMovies, getAllMoviesTrailers }