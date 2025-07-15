import { BlurCircle } from "../components";

function AboutUs() {
    return (
		<div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
			<BlurCircle top="150px" left="0px" />
			<BlurCircle bottom="50px" right="50px" />
			<h1 className="text-3xl md:text-4xl font-semibold mb-6">🟥 About Priyadarshini</h1>
			<p className="text-gray-400 text-lg">
				At Priyadarshini, we believe cinema is more than entertainment — it’s emotion, expression, and experience. Born from a passion for
				film and a drive for innovation, we aim to redefine how people discover and enjoy movies.
				<br />
				Whether you're a die-hard cinephile or someone looking for a perfect weekend plan, Priyadarshini brings the silver screen closer to
				you with a seamless, modern booking experience.
			</p>
			<div className="mt-8">
				<h2 className="text-2xl font-semibold my-4">🎬 What We Do</h2>
				<ul className="list-disc pl-6 text-lg text-gray-400">
					<li>
						<span className="font-semibold">Effortless Ticket Booking</span> – Book your favorite movies at your favorite seats with just
						a few clicks.
					</li>
					<li>
						<span className="font-semibold">Real-Time Show Listings</span> – Updated listings with showtimes, availability, and trailers.
					</li>
					<li>
						<span className="font-semibold">Smart Seat Selection</span> – Visual, intuitive seat layout to help you choose just the right
						spot.
					</li>
					<li>
						<span className="font-semibold">Secure Payments</span> – Fast, safe, and secure checkout experience.
					</li>
				</ul>
			</div>
			<div className="mt-8">
				<h2 className="text-2xl font-semibold my-4">🎯 Our Mission</h2>
				<p className="text-gray-400 text-lg">
					To empower cinema lovers with a smooth, delightful, and reliable movie-going experience through technology, design, and
					dedication.
				</p>
			</div>
			<div className="mt-8">
				<h2 className="text-2xl font-semibold my-4">💡 Why "Priyadarshini"?</h2>
				<p className="text-gray-400 text-lg">
					The name <i>Priyadarshini</i> represents grace, elegance, and cultural richness — values that resonate through our platform and
					service. We are not just a platform, we’re an emotion tied to every ticket, every seat, and every screen.
				</p>
			</div>
		</div>
	);
}

export default AboutUs;
