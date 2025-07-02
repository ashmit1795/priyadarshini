import axios from "axios"
import { TMDB_API_KEY } from "../config/env.js";
import dayjs from "dayjs";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
	retries: 3, // Try up to 3 times
	retryDelay: (retryCount) => {
		console.log(`Retry attempt: ${retryCount}`);
		return axiosRetry.exponentialDelay(retryCount);
	}, // wait 1s, 2s, 4s
	retryCondition: (error) => {
		return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === "ECONNRESET";
	},
});

const getNowPlayingMovies = async (req, res) => {
    try {
        const today = dayjs();
        const oneMonthAgo = today.subtract(1, "month");

        const primaryReleaseYear = today.year();
        const releaseDateGte = oneMonthAgo.format("YYYY-MM-DD");
        const releaseDateLte = today.format("YYYY-MM-DD");
        const url = `https://api.themoviedb.org/3/discover/movie`;
        const axiosConfig = (lang) => ({
            params: {
                include_adult: false,
                include_video: false,
                language: "en-US",
                page: 1,
                sort_by: "popularity.desc",
                watch_region: "IN",
                with_original_language: lang, // 'hi' or 'en'
                primary_release_year: primaryReleaseYear,
                "primary_release_date.gte": releaseDateGte,
                "primary_release_date.lte": releaseDateLte,
            },
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${TMDB_API_KEY}`,
            },
        });

        // Make both requests in parallel
        const [hindiRes, englishRes] = await Promise.all([axios.get(url, axiosConfig("hi")), axios.get(url, axiosConfig("en"))]);

        // Merge results
        const combinedMovies = [...hindiRes.data.results, ...englishRes.data.results];

        const filteredMovies = filterMoviesWithPosterAndBackdrop(combinedMovies);
        
        res.json({ movies: filteredMovies, success: true });
    } catch (error) {
        console.error("Error fetching now playing movies:", error);
        res.status(500).json({ error: error.message, success: false});
    }
}

export {getNowPlayingMovies}

// Utility function
function filterMoviesWithPosterAndBackdrop(movies) {
	return movies.filter((movie) => movie.poster_path && movie.backdrop_path);
}