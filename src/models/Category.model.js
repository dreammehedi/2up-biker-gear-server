import { model, Schema } from "mongoose";

const ProductCategorySchema = new Schema(
  {
    name: { type: String, required: [true, "Category name is required!"] },
    content: { type: String,  },
    slug: {
      type: String,
      required: true,
    },
    imagePublicId: { type: String },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const ProductCategory = model(
  "ProductCategory",
  ProductCategorySchema,
  "ProductCategory"
);

const ProductSubCategorySchema = new Schema(
  {
    name: { type: String, required: [true, "Sub category name is required!"] },
    slug: { type: String },
    category: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: [true, "Product category is required!"],
    },
    image: { type: String },
    imagePublicId: { type: String },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const ProductSubCategory = model(
  "ProductSubCategory",
  ProductSubCategorySchema,
  "ProductSubCategory"
);

const BlogCategorySchema = new Schema(
  {
    name: { type: String, required: [true, "Category name is required!"] },
    slug: {
      type: String,
      required: true,
    },
    imagePublicId: { type: String },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const BlogCategory = model("BlogCategory", BlogCategorySchema, "BlogCategory");

export { BlogCategory, ProductCategory, ProductSubCategory };
