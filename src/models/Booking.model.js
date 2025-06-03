import { model, Schema } from "mongoose";

const BookingSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required!"] },
    email: {
      type: String,
      required: [true, "Email is required!"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required!"],
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required!"],
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required!"],
    },
    numberOfGuests: {
      type: Number,
      required: [true, "Number of guests is required!"],
    },
    RVVehicleType: {
      type: String,
      // required: [true, "RV vehicle type is required!"],
    },
    vehicleLength: {
      type: Number,
      // required: [true, "Vehicle length is required!"],
    },
    specialRequests: {
      type: String,
      // required: [true, "Special requests are required!"],
    },
    title: {
      type: String,
      required: [true, "Title is required!"],
    },
    address: {
      type: String,
      required: [true, "Address is required!"],
    },
    description: {
      type: String,
      required: [true, "Description is required!"],
    },
    type: {
      type: String,
      required: [true, "Type is required!"],
    },
    price: {
      type: Number,
      required: [true, "Price is required!"],
    },

    totalPrice: {
      type: Number,
      required: [true, "Total price is required!"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required!"],
    },
    metadata: {
      type: Object,
    },
    paymentStatus: {
      type: String,
      required: [true, "Payment status is required!"],
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
    paymentId: {
      type: String,
      required: [true, "Payment ID is required!"],
      unique: true,
      default: "",
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required!"],
      default: "",
    },
    paymentDate: {
      type: Date,
      required: [true, "Payment date is required!"],
      default: "",
    },
    paymentAmount: {
      type: Number,
      required: [true, "Payment amount is required!"],
      default: 0,
    },
    invoiceId: {
      type: String,
      required: [true, "Invoice ID is required!"],
      default: "",
    },

    // sessionId: {
    //   type: String,
    //   required: [true, "Session ID is required!"],
    //   default: "",
    // },

    receiptUrl: {
      type: String,
      required: [true, "Receipt URL is required!"],
      default: "",
    },
    orderId: {
      type: String,
      required: [true, "Order ID is required!"],
      default: "",
    },
    selectedSpot: {
      type: Schema.Types.ObjectId,
      ref: "SpotsRvPark",
      required: true,
    },
  },
  { timestamps: true }
);

const Booking = model("Booking", BookingSchema, "Booking");

export default Booking;
