import { model, Schema } from "mongoose";

const BlogSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required!"] },
    slug: { type: String, required: [true, "Slug is required!"] },
    description: { type: String, required: [true, "Description is required!"] },
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "BlogCategory",
        required: [true, "Blog category is required!"],
      },
    ],
    content: { type: String, required: [true, "Blog content is required!"] },
    addedBy: { type: String, required: [true, "Blog added by is required!"] },
    addedDate: { type: Date, required: [true, "Blog added date is required!"] },
    isPopular: {
      type: Boolean,
      required: [true, "Is popular post is required!"],
    },
    image: { type: String },
    imagePublicId: { type: String },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Blog = model("Blog", BlogSchema, "Blog");

export default Blog;
