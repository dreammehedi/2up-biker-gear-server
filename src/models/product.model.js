import { model, Schema } from "mongoose";

// const ProductSchema = new Schema(
//   {
//     name: { type: String, required: true },
//     slug: { type: String, required: true, unique: true },
//     label: { type: String, required: true },
//     sku: { type: String, required: true, unique: true },
//     description: { type: String, required: true },
//     product_space: { type: String, required: true },
//     originalPrice: { type: Number, required: true },
//     discountPrice: { type: Number, default: 0 },
//     shippingCost: { type: Number, default: 0 },
//     categoryId: {
//       type: Schema.Types.ObjectId,
//       ref: "ProductCategory",
//       required: true,
//     },
//     subCategoryId: [{ type: Schema.Types.ObjectId, ref: "ProductSubCategory" }],

//     // Sizes with name, price, and optional image(s)
//     sizes: [
//       {
//         name: { type: String, required: true },
//         price: { type: Number, required: true },
//       },
//     ],

//     // General product-level images (optional)
//     images: [
//       {
//         url: { type: String, required: true },
//         publicId: { type: String, default: "" },
//       },
//     ],
//     images_urls: [{ type: String }],
//     status: { type: Number, default: 1 },
//   },
//   { timestamps: true }
// );

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String },
    vendor: { type: String },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    subCategoryId: [{ type: Schema.Types.ObjectId, ref: "ProductSubCategory" }],
    type: { type: String },
    tags: { type: String },
    published: { type: String },
    option1Name: { type: String },
    sizes: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    option2Name: { type: String },
    colors: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],

    newSizes: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    sku: { type: String },
    newSku: { type: String },
    dealerPrice: { type: Number },
    sellPrice: { type: Number },
    retailPrice: { type: Number },
    variantGrams: { type: String },
    variantInventoryTracker: { type: String },
    variantInventoryQty: { type: String },
    variantInventoryPolicy: { type: String },
    variantFulfillmentService: { type: String },
    variantPrice: { type: String },
    variantCompareAtPrice: { type: String },
    variantRequiresShipping: { type: String },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
      },
    ],
    images_urls: [{ type: String }],
    variantTaxable: { type: String },
    variantBarcode: { type: String },
    imagesPosition: { type: String },
    imageAltTag: { type: String },
    giftCard: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    googleShippingProductCategory: { type: String },

    googleShoppingGender: { type: String },
    googleShoppingAgeGender: { type: String },
    googleShoppingMpn: { type: String },
    googleShoppingCondition: { type: String },
    ageGroup: { type: String },
    careInstruction: { type: String },
    careColor: { type: String },
    fabric: { type: String },
    targetGender: { type: String },
    vehicleType: { type: String },
    variantWeightUnit: { type: String },
    variantTaxCode: { type: String },
    costPerItem: { type: String },

    includeUnitedStates: { type: String },
    priceUnitedStates: { type: String },
    product_space: { type: String },
    originalPrice: { type: Number },
    discountPrice: { type: Number },
    csvStatus: { type: String },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);
const Product = model("Product", ProductSchema, "Product");

export default Product;
