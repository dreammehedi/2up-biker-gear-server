import { model, Schema } from "mongoose";

const ProductItemSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  retailPrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  quantity: { type: Number, required: true, default: 1 },
  subtotal: { type: Number, required: true },
  type: { type: String },
  tags: { type: String },
});

const OrderSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    shippingCost: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    billingAddress: { type: String },
    products: [ProductItemSchema],
    totalPrice: { type: Number, required: true },
    // Payment info
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentId: { type: String, required: true, unique: true },
    paymentMethod: { type: String, required: true },
    paymentDate: { type: Date, required: true },
    paymentAmount: { type: Number, required: true },
    invoiceId: { type: String, required: true },
    receiptUrl: { type: String, required: true },
    orderId: { type: String, required: true },
  },
  { timestamps: true }
);

const Order = model("Order", OrderSchema, "Order");

export default Order;
