import express from "express";
import {
  addData,
  deleteData,
  getData,
  getDataFrontend,
  updateData,
  viewData,
} from "../controllers/HeroBannerSlider.controller.js";
import paginationMiddleware from "../middlewares/pagination.middleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../upload/upload.js";

const HeroBannerSliderRouter = express.Router();

HeroBannerSliderRouter.get("/get-hero-banner-slider", getDataFrontend);
HeroBannerSliderRouter.get(
  "/hero-banner-slider",
  paginationMiddleware,
  getData
);
HeroBannerSliderRouter.post(
  "/add-hero-banner-slider",
  verifyToken,
  upload.single("image"),
  addData
);
HeroBannerSliderRouter.patch(
  "/update-hero-banner-slider",
  verifyToken,
  upload.single("image"),
  updateData
);
HeroBannerSliderRouter.delete(
  "/delete-hero-banner-slider/:id",
  verifyToken,
  deleteData
);
HeroBannerSliderRouter.get(
  "/view-hero-banner-slider/:id",
  verifyToken,
  viewData
);
export default HeroBannerSliderRouter;
