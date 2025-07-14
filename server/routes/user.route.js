import { Router } from "express";
import { getUserBookings, getFavoriteMovies, updateFavoriteMovie, getUser } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/", getUser);
userRouter.get("/bookings", getUserBookings);
userRouter.get("/favorites", getFavoriteMovies);
userRouter.post("/update-favorite", updateFavoriteMovie);


export default userRouter;