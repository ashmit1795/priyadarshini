import { useEffect, useState } from "react";
import config from "../../config/config.js";
import { Loading, Title } from "../../components/index.js";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import kConverter from "../../lib/kConverter.js";
import useAppContext from "../../hooks/useAppContext.js";
import toast from "react-hot-toast";
import { useCallback } from "react";


function AddShows() {
    const currency = config.currency;
    const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [dateTimeSelection, setDateTimeSelection] = useState({});
    /*
        dateTimeSelection is an object where keys are dates and values are arrays of times.
        Example: {
            "2023-10-01": ["10:00", "14:00"],
            "2023-10-02": ["12:00", "16:00"]
        }
        
        So, dateTimeSelection["2023-10-01"] will give you the times for that date.
        And, Object.keys(dateTimeSelection) will give you the dates for which times are selected.
        Object.entries(dateTimeSelection) will give you an array of [date, times] pairs.
        Example: [["2023-10-01", ["10:00", "14:00"]], ["2023-10-02", ["12:00", "16:00"]]]
    */
    const [dateTimeInput, setDateTimeInput] = useState("");
	const [showPrice, setShowPrice] = useState("");
	const [movieTrailer, setMovieTrailer] = useState("");
	const [addingShow, setAddingShow] = useState(false);

	const { axios, getToken, imageBaseUrl, movies } = useAppContext();
	console.log(movies);
	console.log(selectedMovie);

    const fetchNowPlayingMovies = useCallback(async () => {
		try {
			const { data } = await axios.get("/show/now-playing", {
				headers: {
					Authorization: `Bearer ${await getToken()}`,
				},
			});
			if (data.success) {
				setNowPlayingMovies(data.movies);
			} else {
				toast.error(data.message || "Failed to fetch now playing movies");
			}
		} catch (error) {
			console.error("Error fetching now playing movies:", error);
		}
	}, [axios, getToken]);

    const handleDateTimeAdd = () => {
        if (!dateTimeInput) return;
        const [date, time] = dateTimeInput.split("T");
        if (!date || !time) return;

        setDateTimeSelection((prev) => {
            const times = prev[date] || [];
            if (!times.includes(time)) {
                return { ...prev, [date]: [...times, time]}
            }
            return prev;
        })
    }

    const handleRemoveTime = (date, time) => {
        setDateTimeSelection((prev) => {
            const filteredTimes = prev[date].filter((t) => t !== time);
            if (filteredTimes.length === 0) {
                const { [date]: _, ...rest } = prev;
                return rest;
            }
            return {
                ...prev,
                [date]: filteredTimes
            }
        })
    }

    const handleSubmit = async () => { 
        try {
            setAddingShow(true);
            if (!selectedMovie || Object.keys(dateTimeSelection).length === 0 || !showPrice) {
                toast.error("Please select a movie, add show times, and set a price.");
                setAddingShow(false);
                return;
            }
    
            const showsInput = Object.entries(dateTimeSelection).map(([date, times]) => {
                return {
                    date,
                    time: times
                }
            });
    
			const payload = {
				movieId: selectedMovie,
				showsInput,
				showPrice: Number(showPrice),
				movieTrailer: movieTrailer || "",
			};

            const { data } = await axios.post("/show/add", payload, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
            });

            if(data.success) {
                toast.success(data.message);
                setSelectedMovie(null);
                setDateTimeSelection({});
                setShowPrice("");
                setDateTimeInput("");
            }
        } catch (error) {
            console.error("Error adding show:", error);
            toast.error(error.message || "Failed to add show");
        }
        setAddingShow(false);
    }

    useEffect(() => {
        fetchNowPlayingMovies();
    }, [fetchNowPlayingMovies]);

    return nowPlayingMovies.length > 0 ? (
		<>
			<Title text1="Add" text2="Shows" />
			<p className="mt-10 text-lg font-medium">Now Playing Movies</p>
			<div className="overflow-x-auto pb-4">
				<div className="group flex flex-wrap gap-4 mt-4 w-max">
					{nowPlayingMovies.map((movie) => (
						<div
							onClick={() => setSelectedMovie(movie.id)}
							key={movie.id}
							className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300`}
						>
							<div className="relative rounded-lg overflow-hidden">
								<img src={`${imageBaseUrl}${movie.poster_path}`} alt="movie poster" className="w-full object-cover brightness-90" />
								<div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
									<p className="flex items-center gap-1 text-gray-400">
										<StarIcon className="w-4 h-4 text-primary fill-primary" />
										{movie.vote_average.toFixed(1)}
									</p>
									<p className="text-gray-300">{kConverter(movie.vote_count)} Votes</p>
								</div>
							</div>
							{selectedMovie === movie.id && (
								<div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
									<CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
								</div>
							)}
							<p className="font-medium truncate">{movie.title}</p>
							<p className="text-gray-400 text-sm">{movie.release_date}</p>
						</div>
					))}
				</div>
			</div>

			{/* Show Price Input */}
			<div className="mt-8">
				<label className="block text-sm font-medium mb-2">Show Price</label>
				<div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
					<p className="text-gray-400 text-sm">{currency}</p>
					<input
						min={0}
						type="number"
						value={showPrice}
						onChange={(e) => setShowPrice(e.target.value)}
						placeholder="Enter show price"
						className="outline-none"
					/>
				</div>
			</div>
			{/* Movie Trailer Input (moved here for visibility) */}
			{selectedMovie && !movies.some((movie) => String(movie._id) === String(selectedMovie)) && (
				<div className="mt-8">
					<label className="block text-sm font-medium mb-2">Movie Trailer</label>
					<div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
						<input
							type="text"
							value={movieTrailer}
							onChange={(e) => setMovieTrailer(e.target.value)}
							placeholder="Enter movie trailer URL"
							className="outline-none"
						/>
					</div>
				</div>
			)}

			{/* Date & Time Selection */}
			<div className="mt-6">
				<label className="block text-sm font-medium mb-2">Select Date and Time</label>
				<div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
					<input
						type="datetime-local"
						value={dateTimeInput}
						onChange={(e) => setDateTimeInput(e.target.value)}
						className="outline-none rounded-md"
					/>
					<button
						onClick={handleDateTimeAdd}
						className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
					>
						Add Time
					</button>
				</div>
			</div>

			{/* Display Selected Times */}
			{Object.keys(dateTimeSelection).length > 0 && (
				<div className="mt-6">
					<h2 className="mb-2">Selected Date-Time</h2>
					<ul className="space-y-3">
						{Object.entries(dateTimeSelection).map(([date, times]) => (
							<li key={date}>
								<div className="font-medium">{date}</div>
								<div className="flex flex-wrap gap-2 mt-1 text-sm">
									{times.map((time) => (
										<div key={time} className="border border-primary px-2 py-1 flex items-center rounded">
											<span>{time}</span>
											<DeleteIcon
												onClick={() => handleRemoveTime(date, time)}
												width={15}
												className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
											/>
										</div>
									))}
								</div>
							</li>
						))}
					</ul>
				</div>
			)}

			<button
				onClick={handleSubmit}
				disabled={addingShow}
				className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
			>
				{addingShow ? "Adding..." : "Add Show"}
			</button>
		</>
	) : (
		<Loading />
	);
}

export default AddShows;
