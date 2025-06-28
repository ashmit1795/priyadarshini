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
import Layout from "./pages/admin/Layout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AddShows from "./pages/admin/AddShows.jsx";
import ListShows from "./pages/admin/ListShows.jsx";
import ListBookings from "./pages/admin/ListBookings.jsx";


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
				<Route path="/admin/*" element={<Layout />}>
					<Route index element={<Dashboard />} />
					<Route path="add-shows" element={<AddShows />} />
					<Route path="list-shows" element={<ListShows />} />
					<Route path="list-bookings" element={<ListBookings />} />
				</Route>
			</Routes>
			{!isAdminRoute && <Footer />}
		</>
	);
}

export default App;
