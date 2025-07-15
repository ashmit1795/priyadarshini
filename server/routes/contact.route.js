import e, { Router } from "express";
import { contactUs } from "../controllers/contact.controller.js";

const contactRouter = Router();

contactRouter.post("/", contactUs);

export default contactRouter;
