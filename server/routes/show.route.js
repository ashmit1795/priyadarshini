import express, { Router } from "express";
import { addShows, getNowPlayingMovies } from "../controllers/show.controller.js";
import protectAdmin from "../middlewares/auth.middleware.js";

const showRouter = Router();

showRouter.get("/now-playing", protectAdmin, getNowPlayingMovies);
showRouter.post("/add", protectAdmin, addShows);

export default showRouter;