import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, LoaderCircle, PlusSquareIcon, ScanQrCodeIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import useAppContext from "../../../hooks/useAppContext.js";
import { useState, useEffect, useCallback } from "react";
import { useClerk } from "@clerk/clerk-react";


function AdminSidebar() {

	const { openUserProfile } = useClerk();
	
	
	const [user, setUser] = useState({
		name: "Admin User",
		image: ""
	});

	const { axios, getToken } = useAppContext();

	const fetchUser = useCallback(async () => {
		try {
			const { data } = await axios.get("/user/", {
				headers: {
					Authorization: `Bearer ${await getToken()}`,
				},
			});
			if (data.success) {
				setUser(data.user);
			}
		} catch (error) {
			console.error("Error fetching user:", error);
		}
	}, [axios, getToken]);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);


    const adminNavLinks = [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboardIcon },
        { name: "Add Shows", path: "/admin/add-shows", icon: PlusSquareIcon },
        { name: "List Shows", path: "/admin/list-shows", icon: ListIcon },
		{ name: "List Bookings", path: "/admin/list-bookings", icon: ListCollapseIcon },
		{ name: "Verify Booking", path: "/admin/verify-booking", icon: ScanQrCodeIcon }
        
    ]

    return (
		<div className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300/20 text-sm">
			{user.image ? (
				<img onClick={openUserProfile} className="h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto" src={user.image} alt="profile picture" />
			) : (
				<LoaderCircle className="animate-spin w-4 h-4" />
			)}
			<p className="mt-2 text-base max-md:hidden">{user.name}</p>
			<div className="w-full">
				{adminNavLinks.map((link, idx) => (
					<NavLink
						key={idx}
						to={link.path}
						end
						className={({ isActive }) =>
							`relative flex items-center max-md:justify-center gap-2 w-full py-2.5 min-md:pl-10 first:mt-6 text-gray-400 ${
								isActive && "bg-primary/15 text-primary group"
							}`
						}
					>
						{({ isActive }) => (
							<>
								<link.icon className="w-5 h-5" />
								<p className="max-md:hidden">{link.name}</p>
								<span className={`w-1.5 h-10 rounded-l right-0 absolute ${isActive && "bg-primary"}`} />
							</>
						)}
					</NavLink>
				))}
			</div>
		</div>
	);
}

export default AdminSidebar;
