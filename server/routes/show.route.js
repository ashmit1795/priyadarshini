import express, { Router } from "express";
import { addShows, getNowPlayingMovies } from "../controllers/show.controller.js";

const showRouter = Router();

showRouter.get("/now-playing", getNowPlayingMovies);
showRouter.post("/add", addShows);

export default showRouter;