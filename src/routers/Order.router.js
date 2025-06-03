import express from "express";
import {
  createOrder,
  createPaymentIntent,
  getData,
  getOrderData,
  getOrderDetailsData,
  getRecentOrderData,
} from "../controllers/Order.controller.js";
import paginationMiddleware from "../middlewares/pagination.middleware.js";
import { upload } from "../upload/upload.js";

const OrderRouter = express.Router();
OrderRouter.get("/recent-order", paginationMiddleware, getRecentOrderData);
OrderRouter.get("/get-order", getOrderData);
OrderRouter.get("/order", paginationMiddleware, getData);
OrderRouter.post("/create-payment-intent", upload.none(), createPaymentIntent);

OrderRouter.post("/create-order", createOrder);
OrderRouter.get("/view-order/:id", getOrderDetailsData);
export default OrderRouter;
