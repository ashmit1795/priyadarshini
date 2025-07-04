import axios from "axios"
import { TMDB_API_KEY } from "../config/env.js";
import dayjs from "dayjs";
import axiosRetry from "axios-retry";
import fs from "fs";
import path from "path";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";

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

const isProd = process.env.NODE_ENV === "production";
const CACHE_DIR = isProd ? "/tmp" : path.join(process.cwd(), "cache");
const CACHE_FILE = path.join(CACHE_DIR, "nowPlaying.json");

// API endpoint to get now playing movies from TMDB
const getNowPlayingMovies = async (req, res) => {
	try {
		console.log("Fetching now playing movies...");
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

		// 🔐 Save to cache
		if (!fs.existsSync(CACHE_DIR)) {
			fs.mkdirSync(CACHE_DIR, { recursive: true });
		}		
        fs.writeFileSync(CACHE_FILE, JSON.stringify(filteredMovies, null, 2));
        
		console.log(`Fetched ${filteredMovies.length} now playing movies.`);
		res.json({ success: true, movies: filteredMovies });
	} catch (error) {
		console.error("Error fetching now playing movies:", error.message);
		// 📁 Read from cache
		try {
			const cachedData = fs.readFileSync(CACHE_FILE, "utf-8");
			const movies = JSON.parse(cachedData);

			console.log("Serving cached data due to API failure.");
            res.status(200).json({ success: true, movies,  message: `Serving cached data due to API failure due to: ${error.message}` });
		} catch (cacheErr) {
			console.error("Cache read failed:", cacheErr.message);
			res.status(500).json({ success: false, error: error.message, message: "TMDB API and cache both failed"});
		}
	}
}

// API endpoint to add a new show to the database
/*
	This is how data is coming from the client:
	showsInput: [
		{
			date: "2023-09-01",
			time: ["10:00", "14:00", "18:00"]
		},
		{
			date: "2023-09-02",
			time: ["12:00", "16:00"]
		}
	]
*/

const addShows = async (req, res) => { 
	try {
		const { movieId, showsInput, showPrice } = req.body;
		
		let movie = await Movie.findById(movieId);
		if (!movie) {
			// If movie not found, fetch movie details and credits from TMDB and save to DB
			const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}`;
			const movieCreditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits`;

			const movieDetailsResponse = await axios.get(movieDetailsUrl, {
				headers: { Authorization: `Bearer ${TMDB_API_KEY}` },
			});

			const movieCreditsResponse = await axios.get(movieCreditsUrl, {
				headers: { Authorization: `Bearer ${TMDB_API_KEY}` },
			});

			const movieDetailsData = movieDetailsResponse.data;
			const movieCreditsData = movieCreditsResponse.data;

			const movieDetails = {
				_id: movieDetailsData.id.toString(),
				title: movieDetailsData.title,
				overview: movieDetailsData.overview,
				poster_path: movieDetailsData.poster_path,
				backdrop_path: movieDetailsData.backdrop_path,
				release_date: movieDetailsData.release_date,
				original_language: movieDetailsData.original_language,
				tagline: movieDetailsData.tagline || "",
				genres: movieDetailsData.genres.map((genre) => genre.name),
				casts: movieCreditsData.cast.map((cast) => ({
					name: cast.name,
					character: cast.character,
					profile_path: cast.profile_path,
				})),
				vote_average: movieDetailsData.vote_average,
				runtime: movieDetailsData.runtime,
			}

			// Save the movie to the database
			movie = Movie.create(movieDetails);
		}

		const shows = [];
		showsInput.forEach((show) => {
			const showDate = show.date;
			show.time.forEach((time) => {
				const showDateTimeString = `${showDate}T${time}:00`;
				shows.push({
					movie: movieId,
					showDateTime: new Date(showDateTimeString),
					showPrice,
					occupiedSeats: {}, // Initialize with empty object
				});
			});
		});

		if (shows.length > 0) {
			await Show.insertMany(shows);
		}

		res.json({success: true, message: "Shows added successfully", movieId, showsCount: shows.length });
	} catch (error) {
		console.error("Error adding show:", error.message);
		res.status(500).json({ success: false, error: error.message });
	}
}

export {getNowPlayingMovies, addShows}

// Utility function to filter movies with both poster and backdrop
// This function filters out movies that do not have both poster_path and backdrop_path
function filterMoviesWithPosterAndBackdrop(movies) {
	return movies.filter((movie) => movie.poster_path && movie.backdrop_path);
}