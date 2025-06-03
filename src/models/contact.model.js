import { model, Schema } from "mongoose";

const ContactUserSchema = new Schema(
  {
    name: { type: String, required: [true, "User name is required!"] },
    email: { type: String, required: [true, "User email is required!"] },
    message: {
      type: String,
      required: [true, "User message is required!"],
    },
    phone: {
      type: Number,
      required: [true, "User phone is required!"],
    },
    subject: {
      type: String,
      required: [true, "User subject is required!"],
    },
  },
  { timestamps: true }
);

const ContactUser = model("ContactUser", ContactUserSchema, "ContactUser");

export default ContactUser;
