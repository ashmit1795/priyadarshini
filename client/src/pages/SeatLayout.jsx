import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { BlurCircle, Loading } from "../components/index.js";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat.js";
import toast from "react-hot-toast";
import useAppContext from "../hooks/useAppContext.js";
import { useCallback } from "react";
import { initializeSDK, cashfree } from "../config/cashfree.js";

function SeatLayout() {
	initializeSDK();

	const { id, date } = useParams();
	const [selectedSeats, setSelectedSeats] = useState([]);
	const [selectedTime, setSelectedTime] = useState(null);
	const [show, setShow] = useState(null);
	const [occupiedSeats, setOccupiedSeats] = useState([]);

	const { axios, getToken, user } = useAppContext();

	const groupRows = [
		["A", "B"],
		["C", "D"],
		["E", "F"],
		["G", "H"],
		["I", "J"],
	];

	const getShow = useCallback(async () => {
		try {
			const { data } = await axios.get(`/show/${id}`);
			if (data.success) {
				setShow(data);
			}
		} catch (error) {
			console.error("Error fetching show details:", error);
			toast.error("Failed to fetch show details");
			
		}
	}, [axios, id]);

	const handleSeatClick = (seatId) => {
		if (!selectedTime) {
			return toast("Please select time");
		}

		if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
			return toast("You can't select more than 5 seats");
		}

		if (occupiedSeats.includes(seatId)) {
			return toast.error("This seat is already occupied");
		}

		setSelectedSeats((prev) => (prev.includes(seatId) ? prev.filter((seat) => seat !== seatId) : [...prev, seatId]));
	};

	const renderSeats = (row, count = 9) => (
		<div key={row} className="flex gap-2 mt-2">
			<div className="flex flex-wrap items-center justify-center gap-2">
				{Array.from({ length: count }, (_, i) => {
					const seatId = `${row}${i + 1}`;
					return (
						<button
							key={seatId}
							onClick={() => handleSeatClick(seatId)}
							className={`h-8 w-8 rounded border border-primary/60 cursor-pointer 
								${selectedSeats.includes(seatId) && "bg-primary text-white"}
								${occupiedSeats.includes(seatId) && "opacity-50 cursor-not-allowed"}
							`}
						>
							{seatId}
						</button>
					);
				})}
			</div>
		</div>
	);

	const getOccupiedSeats = useCallback(async () => { 
		try {
			const { data } = await axios.get(`/booking/seats/${selectedTime.showId}`);
			if (data.success) {
				setOccupiedSeats(data.occupiedSeats);
			} else {
				toast.error(data.message || "Failed to fetch occupied seats");
			}
		} catch (error) {
			console.error("Error fetching occupied seats:", error);
			toast.error("Failed to fetch occupied seats");
		}
	}, [axios, selectedTime]);

	const bookTicket = async () => {
		try {
			if (!user) return toast.error("You need to be logged in to book a ticket");
			if (!selectedTime || !selectedSeats.length) {
				return toast.error("Please select a time and at least one seat");
			}

			const { data } = await axios.post(`/booking/create`,{
				showId: selectedTime.showId,
				selectedSeats,
			}, {
				headers: {
					Authorization: `Bearer ${await getToken()}`,
				},
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
			console.error("Error booking ticket:", error);
			toast.error("Failed to book ticket");
		}
	}

	useEffect(() => {
		getShow();
	}, [getShow]);

	useEffect(() => {
		if (selectedTime) {
			getOccupiedSeats();
		}
	}, [selectedTime, getOccupiedSeats]);

	return show ? (
		<div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
			{/* Available Timings */}
			<div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
				<p className="text-lg font-semibold px-6">Available Timings</p>
				<div className="mt-5 space-y-1">
					{show.dateTime[date].map((item) => (
						<div
							key={`time-${item.time}`}
							onClick={() => setSelectedTime(item)}
							className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
								selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20"
							}`}
						>
							<ClockIcon className="w-4 h-4" />
							<p className="text-sm">{isoTimeFormat(item.time)}</p>
						</div>
					))}
				</div>
			</div>

			{/* Seats Layout */}
			<div className="relative flex-1 flex flex-col items-center max-md:mt-16">
				<BlurCircle top="-100px" left="-100px" />
				<BlurCircle bottom="0" right="0" />
				<h1 className="text-2xl font-semibold mb-4">Select your seat</h1>
				<img src={assets.screenImage} alt="screen" />
				<p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

				<div className="flex flex-col items-center mt-10 text-xs text-gray-300">
					<div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">{groupRows[0].map((row) => renderSeats(row))}</div>
					<div className="grid grid-cols-2 gap-11">
						{groupRows.slice(1).map((group, idx) => (
							<div key={idx}>{group.map((row) => renderSeats(row))}</div>
						))}
					</div>
				</div>

				<button
					onClick={bookTicket}
					className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95 "
				>
					Proceed to Checkout
					<ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
				</button>
			</div>
		</div>
	) : (
		<Loading />
	);
}

export default SeatLayout;
