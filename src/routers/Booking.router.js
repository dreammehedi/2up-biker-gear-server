import express from "express";
import {
  createBooking,
  createPaymentIntent,
  getBookingData,
  getBookingDetailsData,
  getData,
  getRecentBookingData,
} from "../controllers/Booking.controller.js";
import paginationMiddleware from "../middlewares/pagination.middleware.js";
import { upload } from "../upload/upload.js";

const BookingRouter = express.Router();

BookingRouter.get(
  "/recent-bookings",
  paginationMiddleware,
  getRecentBookingData
);
BookingRouter.get("/get-bookings", getBookingData);
BookingRouter.get("/bookings", paginationMiddleware, getData);
BookingRouter.post(
  "/create-payment-intent",
  upload.none(),
  createPaymentIntent
);

BookingRouter.post("/create-booking", createBooking);
BookingRouter.get("/view-bookings/:id", getBookingDetailsData);
export default BookingRouter;
