import { useEffect, useState } from "react";
import config from "../../config/config.js";
import { Loading, Title } from "../../components";
import dateFormat from "../../lib/dateFormat.js";
import toast from "react-hot-toast";
import { useCallback } from "react";
import useAppContext from "../../hooks/useAppContext.js";

function ListShows() {
    const currency = config.currency;

    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);

    const { axios, getToken, user } = useAppContext();

    const getAllShows = useCallback(async () => {
		try {
			const { data } = await axios.get("/admin/all-shows", {
				headers: {
					Authorization: `Bearer ${await getToken()}`,
				},
			});
			if (data.success) {
				setShows(data.shows);
			} else {
				toast.error(data.message || "Failed to fetch shows");
			}
		} catch (error) {
			console.error("Error fetching shows:", error);
			toast.error(error.message || "Failed to fetch shows");
		}
        setLoading(false);
	}, [axios, getToken]);

    useEffect(() => {
        if (user) getAllShows();
    }, [user, getAllShows]);

    return !loading ? (
		<>
			<Title text1="List" text2="Shows" />
			<div className="max-w-4xl mt-6 overflow-x-auto">
				<table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
					<thead>
						<tr className="bg-primary/20 text-left text-white">
							<th className="p-2 font-medium pl-5">Movie Name</th>
							<th className="p-2 font-medium">Show Time</th>
							<th className="p-2 font-medium">Total Bookings</th>
							<th className="p-2 font-medium">Earnings</th>
						</tr>
					</thead>
					<tbody className="text-sm font-light">
						{shows.map((show) => (
							<tr className="border-b border-primary/10 bg-primary/5 even:bg-primary/10">
								<td className="p-2 min-w-45 pl-5">{show.movie.title}</td>
								<td className="p-2">{dateFormat(show.showDateTime)}</td>
								<td className="p-2">{Object.keys(show.occupiedSeats).length}</td>
                                <td className="p-2">{ currency } {Object.keys(show.occupiedSeats).length * show.showPrice}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	) : (
		<Loading />
	);
}

export default ListShows;
