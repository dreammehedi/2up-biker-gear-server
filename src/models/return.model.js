import { model, Schema } from "mongoose";

const ReturnSchema = new Schema(
  {
    content: { type: String, required: [true, "Return content is required!"] },
  },
  { timestamps: true }
);

const Return = model("Return", ReturnSchema, "Return");

export default Return;
