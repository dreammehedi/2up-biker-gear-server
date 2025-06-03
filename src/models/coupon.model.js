import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CouponSchema = new Schema(
  {
    code: { type: String, required: [true, "Coupon code is required!"] },
    discountPrice: {
      type: Number,
      required: [true, "Discount percentage is required!"],
    },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const Coupon = model("Coupon", CouponSchema, "Coupon");
