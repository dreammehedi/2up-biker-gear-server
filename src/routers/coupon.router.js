import express from "express";
import {
  addData,
  deleteData,
  getData,
  getDataFrontend,
  updateData,
} from "../controllers/coupon.controller.js";
import paginationMiddleware from "../middlewares/pagination.middleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../upload/upload.js";

const CouponRouter = express.Router();

CouponRouter.post("/check-coupon", getDataFrontend);
CouponRouter.get("/coupons", paginationMiddleware, getData);
CouponRouter.post("/add-coupon", verifyToken, upload.none(), addData);
CouponRouter.patch("/update-coupon", verifyToken, upload.none(), updateData);
CouponRouter.delete("/delete-coupon/:id", verifyToken, deleteData);

export default CouponRouter;
