import { useState, useEffect, useCallback } from "react"
import ReactPlayer from "react-player"
import BlurCircle from "../BlurCircle/BlurCircle.jsx";
import { PlayCircleIcon } from "lucide-react";
import useAppContext from "../../hooks/useAppContext.js";


function TrailersSection() {
    const [currentTrailer, setCurrentTrailer] = useState(null);
    const [trailers, setTrailers] = useState([]);

    const { axios } = useAppContext();

    const fetchTrailers = useCallback(async () => {
		try {
			const { data } = await axios.get("/movie/trailers");
			if (data.success) {
				setTrailers(data.trailers.slice(1));
				setCurrentTrailer(data.trailers[0]);
			}
		} catch (error) {
			console.error("Error fetching trailers:", error);
		}
	}, [axios]);

    useEffect(() => {
        fetchTrailers();
    }, [fetchTrailers]);

    return (
		<div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
			<p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">Trailers</p>

			<div className="relative mt-6">
				<BlurCircle top="-100px" right="-100px" />
				{currentTrailer ? (
					<ReactPlayer url={currentTrailer.trailer} controls={false} className="mx-auto max-w-full" width="960px" height="540px" />
				) : (
					<div className="text-center text-gray-400 py-24">No trailers to show.</div>
				)}
			</div>
			{trailers.length > 0 && (
				<div className="group grid grid-cols-4 gap-4 md:gap-8 mt-8 max0w-3xl mx-auto">
					{trailers.map((trailer) => (
						<div
							key={trailer.trailer}
							onClick={() => setCurrentTrailer(trailer)}
							className="relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer"
						>
							<img
								src={getTrailerThumbnail(trailer.trailer)}
								alt="trailer thumbnail"
								className="rounded-lg w-full h-full object-cover brightness-75"
							/>
							<PlayCircleIcon
								strokeWidth={1.6}
								className="absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2"
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// Function to extract YouTube video ID and return thumbnail URL
function getTrailerThumbnail(url, quality = "hqdefault") {
	if (typeof url !== "string") return null;

	// Regex handles:
	//  1. https://www.youtube.com/watch?v=VIDEO_ID
	//  2. https://youtu.be/VIDEO_ID
	//  3. https://www.youtube.com/embed/VIDEO_ID
	const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);

	if (!match) return null; // Not a valid YouTube URL

	const videoId = match[1];
	return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export default TrailersSection;