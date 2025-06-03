import { model, Schema } from "mongoose";

const ShippingMethodSchema = new Schema(
  {
    text: { type: String, required: true },
    price: { type: String, required: true },
    value: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const ShippingCostSchema = new Schema(
  {
    zipCode: { type: Number, required: [true, "Zip code is required!"] },

    method: {
      type: [ShippingMethodSchema],
      required: [true, "At least one shipping method is required!"],
    },
  },
  { timestamps: true }
);

const ShippingCost = model("ShippingCost", ShippingCostSchema, "ShippingCost");

export default ShippingCost;
