import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "../BlurCircle/BlurCircle.jsx";
import MovieCard from "../MovieCard/MovieCard.jsx";
import useAppContext from "../../hooks/useAppContext.js";

function FeaturedSection() {
	const navigate = useNavigate();

	const { shows } = useAppContext();
	
	return shows.length > 0 ? (
		<div className="px-6 md:px-16 lg:px-24 cl:px-44 overflow-hidden">
			<div className="relative flex items-center justify-between pt-20 pb-10">
				<BlurCircle top="0" right="-80px" />
				<p className="text-gray-300 font-medium text-lg">Now Showing</p>
				{ shows.length > 4 && (
					<button
						onClick={() => {
							navigate("/movies");
							scrollTo(0, 0);
						}}
						className="group flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
					>
						View All
						<ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5" />
					</button>
				)}
			</div>
			<div className="flex flex-wrap max-sm:justify-center gap-8 mt-8">
				{shows.slice(0, 4).map((show) => (
					<MovieCard key={show._id} movie={show} />
				))}
			</div>
			{shows.length > 4 && (
				<div className="flex justify-center mt-20">
					<button
						onClick={() => {
							navigate("/movies");
							scrollTo(0, 0);
						}}
						className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
					>
						Show More
					</button>
				</div>
			)}
		</div>
	) : (
		<div className="text-center text-gray-500 py-20">No movies are currently available.</div>
	);
}

export default FeaturedSection;
