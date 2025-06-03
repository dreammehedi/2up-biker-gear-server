import express from "express";
import multer from "multer";
import { addData, getData } from "../controllers/contactUser.controller.js";
import paginationMiddleware from "../middlewares/pagination.middleware.js";

const upload = multer();
const ContactUserRouter = express.Router();

ContactUserRouter.get("/contact-user", paginationMiddleware, getData);
ContactUserRouter.post("/contact-user", upload.none(), addData);

export default ContactUserRouter;
