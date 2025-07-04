import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BlurCircle, DateSelect, MovieCard, Loading } from "../components";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat.js";
import useAppContext from "../hooks/useAppContext.js";
import toast from "react-hot-toast";

function MovieDetails() {
	const { id } = useParams();
	const [show, setShow] = useState(null);
	const navigate = useNavigate();

	const { shows, axios, imageBaseUrl, getToken, user, fetchFavoriteMovies, favoriteMovies } = useAppContext();

	const getShow = useCallback(
		async () => {
			try {
				const show = shows.find((show) => show._id === id);
				if (show) {
					const { data } = await axios.get(`/show/${id}`);
					if (data.success) {
						setShow({
							movie: data.movie,
							dateTime: data.dateTime,
						});
					}
				}
			} catch (error) {
				console.error("Error fetching show details:", error);
				toast.error("Failed to fetch show details");
			}
		}, [shows, id, axios]
	);

	const handleFavorite = async () => {
		try {
			if(!user || !user.id) {
				toast.error("You need to be logged in to favorite a movie");
				return;
			}
			const { data } = await axios.post("/user/update-favorite", { movieId: id }, {
				headers: {
					Authorization: `Bearer ${await getToken()}`,
				}
			});
			if (data.success) {
				await fetchFavoriteMovies();
				toast.success(data.message);
			} else {
				toast.error(data.message || "Failed to update favorite movie");
			}
		} catch (error) {
			console.error("Error updating favorite movie:", error);
			toast.error("Failed to update favorite movie");
		}
	}

	useEffect(() => {
		getShow();
	}, [id, getShow]);

	return show ? (
		<div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
			<div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
				<img
					src={`${imageBaseUrl}${show.movie.poster_path}`}
					alt="movie poster"
					className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
				/>
				<div className="relative flex flex-col gap-3">
					<BlurCircle top="-100px" left="-100px" />
					<p className="text-primary">{show.movie.original_language.toUpperCase()}</p>
					<h1 className="text-4xl font-semibold max-w-96 text-balance">{show.movie.title}</h1>
					<div className="flex items-center gap-2 text-gray-300">
						<StarIcon className="w-5 h-5 text-primary fill-primary" />
						{show.movie.vote_average.toFixed(1)} User Rating
					</div>
					<p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">{show.movie.overview}</p>
					<p>
						{timeFormat(show.movie.runtime)}
						<span> </span>•<span> </span>
						{show.movie.genres.join(", ")}
						<span> </span>•<span> </span>
						{show.movie.release_date.split("-")[0]}
					</p>
					<div className="flex items-center flex-wrap gap-4 mt-4">
						<button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
							<PlayCircleIcon className="w-5 h-5" />
							Watch Trailer
						</button>
						<a
							href="#date-select"
							className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
						>
							Buy Tickets
						</a>
						<button onClick={handleFavorite} className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95">
							<Heart className={`w-5 h-5 ${favoriteMovies.find((movie) => movie._id === id) ? "fill-primary text-primary" : ""} hover:fill-primary-dull hover:text-primary-dull`} />
						</button>
					</div>
				</div>
			</div>

			<p className="text-lg font-medium mt-20">Your Favorite Cast</p>
			<div className="overflow-x-auto no-scrollbar mt-8 pb-4">
				<div className="flex items-center gap-4 w-max px-4">
					{show.movie.casts.slice(0, 12).map(
						(cast, idx) =>
							cast.profile_path && (
								<div key={idx} className="flex flex-col items-center text-center">
									<img
										className="rounded-full h-20 md:hh-20 aspect-square object-cover"
										src={`${imageBaseUrl}${cast.profile_path}`}
										alt={`cast_idx`}
									/>
									<p className="font-medium text-xs mt-3">{cast.name}</p>
								</div>
							)
					)}
				</div>
			</div>

			<DateSelect dateTime={show.dateTime} id={id} />

			<p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
			<div className="flex flex-wrap max-sm:justify-center gap-8">
				{shows.slice(0, 4).map((movie, idx) => (
					<MovieCard key={idx} movie={movie} />
				))}
			</div>
			<div className="flex justify-center mt-20">
				{shows.length > 4 && (
					<button
						onClick={() => {
							navigate("/movies");
							scrollTo(0, 0);
						}}
						className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
					>
						Show More
					</button>
				)}
			</div>
		</div>
	) : (
		<Loading />
	);
}

export default MovieDetails;
