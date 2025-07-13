import { Router } from "express";
import { getAllMovies, getAllMoviesTrailers } from "../controllers/movie.controller.js";

const movieRouter = Router();

movieRouter.get("/", getAllMovies);
movieRouter.get("/trailers", getAllMoviesTrailers);

export default movieRouter;