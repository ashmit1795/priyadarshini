import express, { Router } from "express";
import { getNowPlayingMovies } from "../controllers/show.controller.js";

const showRouter = Router();

showRouter.get("/now-playing", getNowPlayingMovies);

export default showRouter;