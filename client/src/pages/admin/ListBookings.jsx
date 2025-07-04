import { useEffect, useState } from "react";
import config from "../../config/config";
import { Loading, Title } from "../../components";
import dateFormat from "../../lib/dateFormat";
import { useCallback } from "react";
import toast from "react-hot-toast";
import useAppContext from "../../hooks/useAppContext";

function ListBookings() {
    const currency = config.currency;

    const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	
	const { axios, getToken, user } = useAppContext();

	const getAllBookings = useCallback(async () => {
		try {
			const { data } = await axios.get("/admin/all-bookings", {
				headers: {
					Authorization: `Bearer ${await getToken()}`,
				},
			});
			if (data.success) {
				setBookings(data.bookings);
			} else {
				toast.error(data.message || "Failed to fetch bookings");
			}
		} catch (error) {
			console.error("Error fetching bookings:", error);
			toast.error(error.message || "Failed to fetch bookings");
		}
		setLoading(false);
	}, [axios, getToken]);

    useEffect(() => {
        if(user) getAllBookings();
    }, [getAllBookings, user]);

    return !loading ? (
		<div>
			<Title text1="List" text2="Bookings" />
			<div className="max-w-4xl mt-6 overflow-x-auto">
				<table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
					<thead>
						<tr className="bg-primary/20 text-left text-white">
							<th className="p-2 font-medium pl-5">User Name</th>
							<th className="p-2 font-medium">Movie Name</th>
							<th className="p-2 font-medium">Show Time</th>
							<th className="p-2 font-medium">Seats</th>
							<th className="p-2 font-medium">Amount</th>
						</tr>
					</thead>
					<tbody className="text-sm font-light">
						{bookings.map((item, idx) => (
							<tr key={idx} className="border-b border-primary/20 bg-primary/5 even:bg-primary/10">
								<td className="p-2 min-w-45 pl-5">{item.user.name}</td>
								<td className="p-2">{item.show.movie.title}</td>
								<td className="p-2">{dateFormat(item.show.showDateTime)}</td>
								<td className="p-2">
									{Object.keys(item.bookedSeats)
										.map((seat) => item.bookedSeats[seat])
										.join(", ")}
								</td>
								<td className="p-2">
									{currency} {item.amount}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	) : (
		<Loading />
	);
}

export default ListBookings;
