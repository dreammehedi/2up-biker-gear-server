import { model, Schema } from "mongoose";

const AboutUsSchema = new Schema(
  {
    name: { type: String, required: [true, "Author name is required!"] },
    designation: {
      type: String,
      required: [true, "Author designation is required!"],
    },
    bio: {
      type: String,
      required: [true, "Author bio is required!"],
    },
    videoUrl: {
      type: String,
      required: [true, "Author us video url is required!"],
    },
    image: { type: String },
    imagePublicId: { type: String },
  },
  { timestamps: true }
);

const AboutUs = model("AboutUs", AboutUsSchema, "AboutUs");

export default AboutUs;
