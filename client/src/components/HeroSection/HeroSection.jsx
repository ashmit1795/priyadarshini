import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function HeroSection() {

    const navigate = useNavigate();
    return (
		<div className="flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url('/hero-bg.png')] bg-cover bg-center h-screen">
			<div className="absolute inset-0 bg-black/10 z-0" />

			<h1 className="z-10 text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110">
				Welcome to <br />
				<span className="text-[#f30e0e]">P</span>riyadarshini<span className="text-[#f30e0e]">.</span>
			</h1>
			<p className="z-10  max-wd-md text-gray-300">
				Book the Magic
				<span className="text-[#f30e0e]">. </span>
				Live the Moment
				<span className="text-[#f30e0e]">.</span>
			</p>
			<button
				onClick={() => navigate("/movies")}
				className="z-10 flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
			>
				Explore Movies
				<ArrowRight className="w-5 h-5" />
			</button>
		</div>
	);
}

export default HeroSection;

// import { ArrowRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// function HeroSection() {
// 	const navigate = useNavigate();

// 	return (
// 		<div
// 			className="relative h-screen bg-cover bg-center px-6 md:px-16 lg:px-36 flex items-center"
// 			style={{ backgroundImage: "url('/hero-bg.png')" }}
// 		>
// 			{/* Optional: dark overlay for readability */}
// 			<div className="absolute inset-0 bg-black/40 z-0" />

// 			<div className="relative z-10 text-left max-w-3xl space-y-6">
// 				<h1 className="text-4xl sm:text-5xl md:text-[64px] font-bold leading-tight text-white">
// 					Welcome to <br />
// 					<span className="text-[#f30e0e]">P</span>riyadarshini
// 					<span className="text-[#f30e0e]">.</span>
// 				</h1>

// 				<p className="text-gray-300 text-base sm:text-lg">
// 					Redefining cinema with <span className="text-white font-medium">passion</span>,
// 					<span className="text-white font-medium"> precision</span>, and
// 					<span className="text-white font-medium"> performance</span>.
// 				</p>

// 				<button
// 					onClick={() => navigate("/movies")}
// 					className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dull text-sm font-medium px-6 py-3 rounded-full transition"
// 				>
// 					Explore Movies
// 					<ArrowRight className="w-4 h-4" />
// 				</button>
// 			</div>
// 		</div>
// 	);
// }

// export default HeroSection;

