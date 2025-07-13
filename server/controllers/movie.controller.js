import Movie from "../models/movie.model.js";

const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json({ success: true, movies });
    } catch (error) {
        console.error("Error fetching movies:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

const getAllMoviesTrailers = async (req, res) => {
    try {
        const trailers = await Movie.find().select("_id title trailer").sort({ createdAt: -1 });
        res.json({ success: true, trailers });
    } catch (error) {
        console.error("Error fetching trailers:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { getAllMovies, getAllMoviesTrailers }