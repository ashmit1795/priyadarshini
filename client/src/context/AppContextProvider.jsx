import { useState, useEffect } from "react";
import axios from "axios";
import config from "../config/config.js";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppContext from "./AppContext.js";

axios.defaults.baseURL = config.serverUrl;


export const AppContextProvider = ({ children }) => {

    const [isAdmin, setIsAdmin] = useState(false);
    const [shows, setShows] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);

    const { user } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const fetchIsAdmin = async () => {
        try {
            const { data } = await axios.get("/admin/is-admin", {
                headers: {
                    Authorization: `Bearer ${await getToken()}` 
                }
            });
            setIsAdmin(data.isAdmin);

            if (!data.isAdmin && location.pathname.startsWith("/admin")) {
                navigate("/"); // Redirect to home if not admin
                toast.error("You are not authorized to access this page.");
            }
        } catch (error) {
            console.error("Error fetching admin status:", error);
        }
    };

    const fetchShows = async () => {
        try {
            const { data } = await axios.get("/show/all");
            if(data.success) {
                setShows(data.shows);
            } else {
                toast.error(data.message || "Failed to fetch shows");
            }
        } catch (error) {
            console.error("Error fetching shows:", error);
        }
    }

    const fetchFavoriteMovies = async () => { 
        try {
            const { data } = await axios.get("/user/favorites", {
                headers: {
                    Authorization: `Bearer ${await getToken()}` 
                }
            });
            if(data.success) {
                setFavoriteMovies(data.favoriteMovies);
            } else {
                toast.error(data.message || "Failed to fetch favorite movies");
            }
        } catch (error) {
            console.error("Error fetching favorite movies:", error);
            
        }
    }

    useEffect(() => {
        fetchShows();
    }, []);

    useEffect(() => {
        if (user) {
            fetchIsAdmin();
            fetchFavoriteMovies();
        }
    }, [user]);

    const value = {
        axios,
        isAdmin,
        shows,
        favoriteMovies,
        user,
        getToken,
        fetchIsAdmin,
        fetchShows,
        fetchFavoriteMovies,
        navigate
    };
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

