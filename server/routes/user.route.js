import express, { Router } from "express";
import { getUserBookings, getFavoriteMovies, updateFavoriteMovie } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/bookings", getUserBookings);
userRouter.get("/favorites", getFavoriteMovies);
userRouter.post("/update-favorite", updateFavoriteMovie);


export default userRouter;