import React, { useEffect, useState } from 'react'
import config from '../config/config.js';
import { BlurCircle, Loading } from '../components/index.js';
import timeFormat from '../lib/timeFormat.js';
import dateFormat from '../lib/dateFormat.js';
import useAppContext from '../hooks/useAppContext.js';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { initializeSDK, cashfree } from "../config/cashfree.js";
import { QRCodeSVG } from "qrcode.react";
import { XIcon } from 'lucide-react';

function MyBookings() {
	initializeSDK();

	const currency = config.currency;
	const [bookings, setBookings] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState(null);


	const { axios, imageBaseUrl, getToken, user } = useAppContext();

	const handleCardClick = (booking) => {
		setSelectedBooking(booking);
		setShowModal(true);
	};


	const getMyBookings = useCallback(async () => {
		try {
			const { data } = await axios.get("/user/bookings", {
				headers: {
					Authorization: `Bearer ${await getToken()}`,
				}
			});

			if (data.success) {
				setBookings(data.bookings);
			} else {
				toast.error(data.message || "Failed to fetch bookings");
			}
		} catch (error) {
			console.error("Error fetching bookings:", error);
			toast.error("Failed to fetch bookings");
		}

		setIsLoading(false);
	}, [axios, getToken]);

	const completeBooking = async (booking) => {
		try {
			const { data } = await axios.post(`/booking/complete-booking/${booking._id}`, {
				headers: {
					Authorization: `Bearer ${await getToken()}`,
				}
			});

			if (data.success) {
				let checkoutOptions = {
					paymentSessionId: data.sessionId,
				};
				cashfree.checkout(checkoutOptions);
			} else {
				toast.error(data.message || "Failed to book ticket");
			}
		} catch (error) {
			console.error("Error completing booking:", error);
			toast.error(error.response?.data?.message || "Failed to complete booking");
			
		}
	};

	useEffect(() => {
		if (user) getMyBookings();
	}, [user, getMyBookings]);

	return !isLoading ? (
		<div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
			<BlurCircle top="100px" left="100px" />
			<div>
				<BlurCircle bottom="0px" left="600px" />
			</div>
			<h1 className="text-lg font-semibold mb-4">My Bookings</h1>
			{bookings.length > 0 ? (
				bookings.map((item, idx) => (
					<div
						onClick={() => handleCardClick(item)}
						key={idx}
						className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
					>
						<div className="flex flex-col md:flex-row">
							<img
								src={`${imageBaseUrl}${item.show.movie.backdrop_path}`}
								alt="movie poster"
								className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
							/>
							<div className="flex flex-col p-4">
								<p className="text-lg font-semibold">{item.show.movie.title}</p>
								<p className="text-gray-400 text-sm">{timeFormat(item.show.movie.runtime)}</p>
								<p className="text-gray-400 text-sm mt-auto">{dateFormat(item.show.showDateTime)}</p>
							</div>
						</div>

						<div className="flex flex-col md:items-end md:text-right justify-between p-4">
							<div className="flex items-center gap-4">
								<p className="text-2xl font-semibold mb-3">
									{currency}
									{item.amount}
								</p>
								{!item.isPaid && (
									<button
										onClick={() => completeBooking(item)}
										className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer"
									>
										Pay Now
									</button>
								)}
							</div>
							<div className="text-sm">
								<p>
									<span className="text-gray-400">Total Tickets:</span>
									{item.bookedSeats.length}
								</p>
								<p>
									<span className="text-gray-400">Seat Number:</span>
									{item.bookedSeats.join(", ")}
								</p>
							</div>
						</div>
					</div>
				))
			) : (
				<div className="text-center text-gray-500 py-20">No bookings found.</div>
			)}
			{showModal && selectedBooking && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
					<div className="bg-zinc-900 text-white rounded-xl shadow-xl p-6 max-w-lg w-full relative animate-fade-in">
						{/* <button className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">×</button> */}
						<XIcon
							className="absolute top-3 right-3 w-6 h-6 cursor-pointer text-gray-400 hover:text-white"
							onClick={() => setShowModal(false)}
						/>

						<h2 className="text-xl font-bold mb-2">{selectedBooking.show.movie.title}</h2>
						<p className="text-sm mb-1">{dateFormat(selectedBooking.show.showDateTime)}</p>
						<p className="text-sm mb-1">{timeFormat(selectedBooking.show.movie.runtime)}</p>
						<p className="text-sm mb-2">Seats: {selectedBooking.bookedSeats.join(", ")}</p>
						{!selectedBooking.isPaid &&<p className="text-sm mb-4">Amount: ₹{selectedBooking.amount}</p>}

						{selectedBooking.isPaid ? (
							<>
								{/* ✅ Show QR code if paid */}
								<div className="flex justify-center mt-4">
									<QRCodeSVG value={selectedBooking.qrToken} size={200} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} />
								</div>
								<p className="text-xs text-center mt-4 text-gray-400">
									Show this QR at entry. Valid 1 hour before showtime until the show ends.
								</p>
							</>
						) : (
							<>
								{/* ❌ Not Paid → show warning and Pay Now button */}
								<p className="text-sm text-red-400 font-medium mt-4 text-center">
									⚠️ Booking not completed. Complete payment to confirm your seat.
								</p>
								<p className="text-xs text-center mt-1 text-gray-400">Seats will be auto-released if not paid within 10 minutes.</p>

								<div className="flex justify-center mt-5">
									<button
										onClick={() => {
											setShowModal(false);
											completeBooking(selectedBooking);
										}}
										className="bg-primary hover:bg-primary-dull px-6 py-2 text-sm rounded-full font-medium cursor-pointer"
									>
										Pay Now
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	) : (
		<Loading />
	);
}

export default MyBookings