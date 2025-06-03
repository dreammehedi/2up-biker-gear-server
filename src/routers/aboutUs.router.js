import express from "express";
import { getData, updateData } from "../controllers/AboutUs.controller.js";

import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../upload/upload.js";

const AboutUsRouter = express.Router();

AboutUsRouter.get("/about-us", getData);
AboutUsRouter.patch(
  "/update-about-us",
  verifyToken,
  upload.single("image"),
  updateData
);

export default AboutUsRouter;
