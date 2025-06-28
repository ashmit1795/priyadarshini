import { useEffect, useState } from "react";
import config from "../../config/config";
import { dummyBookingData } from "../../assets/assets";
import { Loading, Title } from "../../components";
import dateFormat from "../../lib/dateFormat";

function ListBookings() {
    const currency = config.currency;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAllBookings = async () => {
        setBookings(dummyBookingData);
        setLoading(false);
    }

    useEffect(() => {
        getAllBookings();
    }, [])

    return !loading ? (
		<div>
			<Title text1="List1" text2="Bookings" />
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
