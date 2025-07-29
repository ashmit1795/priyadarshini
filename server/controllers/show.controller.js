import axios from "axios"
import { TMDB_API_KEY } from "../config/env.js";
import dayjs from "dayjs";
import axiosRetry from "axios-retry";
import fs from "fs";
import path from "path";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";
import { inngest } from "../inngest/index.js";
import checkDBConnection from "../utils/checkDBConnection.js";

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
		await checkDBConnection();
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
		const { movieId, showsInput, showPrice, movieTrailer } = req.body;
		
		let movie = await Movie.findById(movieId);
		if (!movie) {

			// Check if the movieTrailer url is valid
			if (movieTrailer && !isValidYouTubeTrailerUrl(movieTrailer)) {
				return res.status(400).json({ success: false, message: "Invalid YouTube trailer URL" });
			}

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
				trailer: movieTrailer || "",
			};

			// Save the movie to the database
			movie = await Movie.create(movieDetails);

			const addedMovie = await Movie.findById(movie._id);

			// Inngest event to notify users that a new movie has been added
			await inngest.send({
				name: "app/show.added",
				data: {
					movieId: addedMovie._id
				}
			})
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
		res.status(500).json({ success: false, message: error.message });
	}
}

// API endpoint to get all shows from the database
const getShows = async (req, res) => {
	await checkDBConnection();
	try {
		const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate("movie").sort({ showDateTime: 1 });

		// Filter uniques shows
		const uniqueShows = new Set(shows.map(show => show.movie));
		res.json({ success: true, shows: Array.from(uniqueShows) });
	} catch (error) {
		console.error("Error fetching shows:", error.message);
		res.status(500).json({ success: false, message: error.message });
	}
}

// API endpoint to get all shows for a specific movie
const getShowsForMovie = async (req, res) => {
	const { movieId } = req.params;
	try {
		await checkDBConnection();
		const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } });

		const movie = await Movie.findById(movieId);
		if (!movie) {
			return res.json({ success: false, message: "Movie not found" });
		}
		const dateTime = {};
		/*
			dateTime is an object where keys are dates in YYYY-MM-DD format
			and values are arrays of objects with show time and show ID.
			Example:
			{
				"2023-09-01": [
					{ time: "2023-09-01T10:00:00Z", showId: "show1" },
					{ time: "2023-09-01T14:00:00Z", showId: "show2" }
				],
				"2023-09-02": [
					{ time: "2023-09-02T12:00:00Z", showId: "show3" }
				]
			}
		*/
		shows.forEach((show) => {
			const date = show.showDateTime.toISOString().split("T")[0];
			if (!dateTime[date]) {
				dateTime[date] = [];
			}
			dateTime[date].push({ time: show.showDateTime, showId: show._id });
		});
		res.json({ success: true, movie, dateTime });
	} catch (error) {
		console.error("Error fetching shows for movie:", error.message);
		res.status(500).json({ success: false, message: error.message });
	}
}

export { getNowPlayingMovies, addShows, getShows, getShowsForMovie };

// Utility function to filter movies with both poster and backdrop
// This function filters out movies that do not have both poster_path and backdrop_path
function filterMoviesWithPosterAndBackdrop(movies) {
	return movies.filter((movie) => movie.poster_path && movie.backdrop_path);
}

// Utility function to check if the trailer's youtube URL is valid
function isValidYouTubeTrailerUrl(url) {
	if (typeof url !== "string") return null;

	// Regex handles:
	//  1. https://www.youtube.com/watch?v=VIDEO_ID
	//  2. https://youtu.be/VIDEO_ID
	//  3. https://www.youtube.com/embed/VIDEO_ID

	const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);

	// return true if match is found, false otherwise
	return match ? true : false;
}