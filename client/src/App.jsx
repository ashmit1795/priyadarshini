import { Route, Routes, useLocation } from "react-router-dom";
import { Navbar, Footer, Loading } from "./components";
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
import useAppContext from "./hooks/useAppContext.js";
import { SignIn } from "@clerk/clerk-react";
import VerifyBooking from "./pages/admin/VerifyBooking.jsx";
import PastShows from "./pages/admin/PastShows.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import ContactUs from "./pages/ContactUs.jsx";


function App() {

	const isAdminRoute = useLocation().pathname.startsWith("/admin");

	const { user } = useAppContext();

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
				<Route path="/about-us" element={<AboutUs />} />
				<Route path="/terms-and-conditions" element={<TermsAndConditions />} />
				<Route path="/privacy-policy" element={<PrivacyPolicy />} />
				<Route path="/contact-us" element={<ContactUs />} />
				<Route path="/loading/:nextUrl" element={<Loading />} />
				<Route
					path="/admin/*"
					element={
						user ? (
							<Layout />
						) : (
							<div className="min-h-screen flex justify-center items-center">
								<SignIn fallbackRedirectUrl={"/admin"} />
							</div>
						)
					}
				>
					<Route index element={<Dashboard />} />
					<Route path="add-shows" element={<AddShows />} />
					<Route path="list-shows" element={<ListShows />} />
					<Route path="list-bookings" element={<ListBookings />} />
					<Route path="verify-booking" element={<VerifyBooking />} />
					<Route path="past-shows" element={<PastShows />} />
				</Route>
			</Routes>
			{!isAdminRoute && <Footer />}
		</>
	);
}

export default App;
