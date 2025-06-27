import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Navbar, Footer } from "./components";
import Movies from "./pages/Movies.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import SeatLayout from "./pages/SeatLayout.jsx";
import Favorite from "./pages/Favorite.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Home from "./pages/Home.jsx";
import { Toaster } from "react-hot-toast"

function App() {

	const isAdminRoute = useLocation().pathname.startsWith("/admin");

	return (
		<>
			<Toaster />
			{!isAdminRoute && <Navbar />}
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/movies" element={<Movies />} />
				<Route path="/movies/:id" element={<MovieDetails />} />
				<Route path="/movies/:id/:date" element={<SeatLayout />} />
				<Route path="/favorite" element={<Favorite />} />
				<Route path="/my-bookings" element={<MyBookings />} />
			</Routes>
			{!isAdminRoute && <Footer />}
		</>
	);
}

export default App;
