import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function HeroSection() {

    const navigate = useNavigate();
    return (
		<div className="flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url('/hero-bg.png')] bg-cover bg-center h-screen">
			<div className="absolute inset-0 bg-black/10 z-0" />

			<h1 className="z-10 text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110">
				Welcome to <br />
				<span className="text-primary">P</span>riyadarshini<span className="text-primary">.</span>
			</h1>
			<p className="z-10  max-wd-md text-gray-300">
				Book the Magic
				<span className="text-primary">. </span>
				Live the Moment
				<span className="text-primary">.</span>
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

