import cloudinary from "../config/cloudinary.config.js";
import {
  ProductCategory,
  ProductSubCategory,
} from "../models/Category.model.js";
import Product from "../models/product.model.js";

import slugify from "slugify";

import mongoose from "mongoose";

// export const getProductCartsData = async (req, res) => {
//   try {
//     let { productIds } = req.query;

//     // If productIds is a single string, split it into an array
//     if (typeof productIds === "string") {
//       productIds = productIds.split(",");
//     }

//     // Validate if all IDs are valid ObjectId strings (24 character hex string)
//     const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

//     const invalidIds = productIds.filter((id) => !isValidObjectId(id));
//     if (invalidIds.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid ObjectId(s): ${invalidIds.join(", ")}`,
//       });
//     }

//     // Convert string productIds to ObjectId using the `new` keyword
//     const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));

//     // Fetch the products using the provided productIds (now as ObjectId)
//     const products = await Product.find({ _id: { $in: objectIds } })
//       .populate("categoryId")
//       .populate("subCategoryId");

//     res.status(200).json({
//       success: true,
//       payload: products,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch product cart data",
//     });
//   }
// };

// finally

// export const getData = async (req, res) => {
//   try {
//     const { skip, limit } = req.pagination;
//     const search = req.query.search || "";
//     const categorySlug = req.query.category || "";
//     const typeQuery = req.query.type || ""; // example: "casual-shirts"

//     const searchRegex = new RegExp(search, "i");

//     // Base query
//     const query = {
//       $and: [{ $or: [{ name: searchRegex }] }],
//     };

//     // Filter by category slug
//     if (categorySlug) {
//       const category = await ProductCategory.findOne({ slug: categorySlug });
//       if (category?._id) {
//         query.$and.push({ categoryId: category._id });
//       }
//     }

//     // Filter by type (case-insensitive, space-aware)
//     if (typeQuery) {
//       const typeRegex = new RegExp(typeQuery.replace(/-/g, " "), "i");
//       query.$and.push({ type: typeRegex });
//     }

//     // Fetch data
//     const data = await Product.find(query)
//       .skip(skip)
//       .limit(limit)
//       .populate("categoryId")
//       .populate("subCategoryId");

//     const totalDataCount = await Product.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       payload: data,
//       pagination: {
//         totalData: totalDataCount,
//         totalPages: Math.ceil(totalDataCount / limit),
//         currentPage: req.pagination.page,
//         limit,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const addData = async (req, res) => {
//   try {
//     const {
//       name,
//       slug: csvSlug,
//       description,
//       vendor,
//       categoryId,
//       subCategoryId,
//       type,
//       tags,
//       published,
//       option1Name,
//       sizes,
//       option2Name,
//       colors,
//       sku,
//       variantGrams,
//       variantInventoryTracker,
//       variantInventoryQty,
//       variantInventoryPolicy,
//       variantFulfillmentService,
//       variantPrice,
//       variantCompareAtPrice,
//       variantRequiresShipping,
//       images_urls,
//       variantTaxable,
//       variantBarcode,
//       imagesPosition,
//       imageAltTag,
//       giftCard,
//       seoTitle,
//       seoDescription,
//       googleShippingProductCategory,
//       googleShoppingGender,
//       googleShoppingAgeGender,
//       googleShoppingMpn,
//       googleShoppingCondition,
//       ageGroup,
//       careInstruction,
//       careColor,
//       fabric,
//       targetGender,
//       vehicleType,
//       variantWeightUnit,
//       variantTaxCode,
//       costPerItem,
//       includeUnitedStates,
//       priceUnitedStates,
//       product_space,
//       originalPrice,
//       discountPrice,
//       csvStatus,
//     } = req.body;

//     let uploadedImages = [];

//     if (req.files && req.files.length > 0) {
//       const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
//       for (const file of req.files) {
//         if (!allowedTypes.includes(file.mimetype)) {
//           return res.status(400).json({
//             success: false,
//             message: `Invalid file type: ${file.originalname}. Only JPG and PNG are allowed.`,
//           });
//         }
//       }

//       // Process valid files
//       uploadedImages = await Promise.all(
//         req.files.map((file) => ({
//           url: file.path,
//           publicId: file.filename,
//         }))
//       );
//     }

//     // Validate at least one image source
//     if (
//       (!uploadedImages || uploadedImages.length === 0) &&
//       (!images_urls || images_urls.length === 0)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one image (upload or URL) is required.",
//       });
//     }
//     const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
//     const slug = name.toLowerCase().split(" ").join("-");
//     const newProduct = new Product({
//       name,
//       slug: csvSlug || slug,
//       description,
//       vendor,
//       type,
//       tags,
//       published,
//       option1Name,
//       option2Name,
//       colors,
//       sku,
//       variantGrams,
//       variantInventoryTracker,
//       variantInventoryQty,
//       variantInventoryPolicy,
//       variantFulfillmentService,
//       variantPrice,
//       variantCompareAtPrice,
//       variantRequiresShipping,
//       variantTaxable,
//       variantBarcode,
//       imagesPosition,
//       imageAltTag,
//       giftCard,
//       seoTitle,
//       seoDescription,
//       googleShippingProductCategory,
//       googleShoppingGender,
//       googleShoppingAgeGender,
//       googleShoppingMpn,
//       googleShoppingCondition,
//       ageGroup,
//       careInstruction,
//       careColor,
//       fabric,
//       targetGender,
//       vehicleType,
//       variantWeightUnit,
//       variantTaxCode,
//       costPerItem,
//       includeUnitedStates,
//       priceUnitedStates,
//       product_space,
//       originalPrice,
//       discountPrice,
//       csvStatus,
//       sizes: parsedSizes,
//       images: uploadedImages,
//       images_urls: images_urls || [],
//       categoryId,
//       subCategoryId: subCategoryId ? subCategoryId.split(",") : [],
//       status: 1,
//     });

//     await newProduct.save();

//     res.status(201).json({
//       success: true,
//       message: "Product added successfully!",
//       product: newProduct,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to add product!",
//     });
//   }
// };

// export const getData = async (req, res) => {
//   try {
//     const { skip, limit } = req.pagination;
//     const search = req.query.search || "";
//     const categorySlug = req.query.category || "";
//     const typeQuery = req.query.type || ""; // e.g., "casual-shirts"

//     const searchRegex = new RegExp(search, "i");
//     const query = {
//       $and: [],
//     };
//     console.log(searchRegex);
//     // Search filter (searches in name)
//     if (search) {
//       query.$and.push({ name: searchRegex }, { type: searchRegex });
//     }

//     // Filter by category slug
//     if (categorySlug) {
//       const category = await ProductCategory.findOne({ slug: categorySlug });
//       if (category?._id) {
//         query.$and.push({ categoryId: category._id });
//       }
//     }

//     // Filter by type or fallback to name and category name
//     if (typeQuery) {
//       const typeText = typeQuery.replace(/-/g, " ");
//       const typeRegex = new RegExp(typeText, "i");

//       query.$and.push({
//         $or: [
//           { type: typeRegex },
//           { name: typeRegex },
//           { "categoryId.name": typeRegex }, // requires populate with name field
//         ],
//       });
//     }

//     // Fetch data with population
//     const data = await Product.find(query)
//       .skip(skip)
//       .limit(limit)
//       .populate("categoryId", "name")
//       .populate("subCategoryId");

//     const totalDataCount = await Product.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       payload: data,
//       pagination: {
//         totalData: totalDataCount,
//         totalPages: Math.ceil(totalDataCount / limit),
//         currentPage: req.pagination.page,
//         limit,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getProductCartsData = async (req, res) => {
  try {
    let { productIds } = req.query;

    // If productIds is a single string, split it into an array
    if (typeof productIds === "string") {
      productIds = productIds.split(",");
    }

    // Remove empty strings or falsy values
    productIds = productIds.filter((id) => id && id.trim() !== "");

    // Validate if all IDs are valid ObjectId strings
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    const invalidIds = productIds.filter((id) => !isValidObjectId(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid ObjectId(s): ${invalidIds.join(", ")}`,
      });
    }

    // Convert to ObjectIds
    const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));

    // Query the database
    const products = await Product.find({ _id: { $in: objectIds } })
      .populate("categoryId")
      .populate("subCategoryId");

    res.status(200).json({
      success: true,
      payload: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product cart data",
    });
  }
};

export const getData = async (req, res) => {
  try {
    const { skip, limit } = req.pagination;
    const search = req.query.search || "";
    const categorySlug = req.query.category || "";
    const typeQuery = req.query.type || "";

    const searchRegex = new RegExp(search, "i");

    const query = {
      $and: [],
    };

    // Global search in name, type, sku, and category name
    if (search) {
      // First, find matching category IDs by name
      const matchingCategories = await ProductCategory.find(
        { name: searchRegex },
        "_id"
      );

      query.$and.push({
        $or: [
          { name: searchRegex },
          { type: searchRegex },
          { sku: searchRegex },
          { categoryId: { $in: matchingCategories.map((cat) => cat._id) } },
        ],
      });
    }

    // Filter by category slug (if explicitly passed)
    if (categorySlug) {
      const category = await ProductCategory.findOne({ slug: categorySlug });
      if (category?._id) {
        query.$and.push({ categoryId: category._id });
      }
    }

    // Filter by type query (like from URL slug: "casual-shirts")
    if (typeQuery) {
      const typeText = typeQuery.replace(/-/g, " ");
      const typeRegex = new RegExp(typeText, "i");

      query.$and.push({
        $or: [{ type: typeRegex }, { name: typeRegex }, { sku: typeRegex }],
      });
    }

    // If no conditions in $and, remove it to fetch all
    if (!query.$and.length) {
      delete query.$and;
    }

    const data = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name")
      .populate("subCategoryId");

    const totalDataCount = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      payload: data,
      pagination: {
        totalData: totalDataCount,
        totalPages: Math.ceil(totalDataCount / limit),
        currentPage: req.pagination.page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addData = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      vendor,
      categoryId,
      subCategoryId,
      type,
      tags,
      published,
      option1Name,
      sizes,
      option2Name,
      colors,
      sku,
      dealerPrice,
      sellPrice,
      retailPrice,
      variantGrams,
      variantInventoryTracker,
      variantInventoryQty,
      variantInventoryPolicy,
      variantFulfillmentService,
      variantPrice,
      variantCompareAtPrice,
      variantRequiresShipping,
      images,
      images_urls,
      variantTaxable,
      variantBarcode,
      imagesPosition,
      imageAltTag,
      giftCard,
      seoTitle,
      seoDescription,
      googleShippingProductCategory,
      googleShoppingGender,
      googleShoppingAgeGender,
      googleShoppingMpn,
      googleShoppingCondition,
      ageGroup,
      careInstruction,
      careColor,
      fabric,
      targetGender,
      vehicleType,
      variantWeightUnit,
      variantTaxCode,
      costPerItem,
      includeUnitedStates,
      priceUnitedStates,
      product_space,
      originalPrice,
      discountPrice,
      csvStatus,
      status,
    } = req.body;
    const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    const newProduct = new Product({
      name,
      slug,
      description,
      vendor,
      categoryId,
      subCategoryId,
      type,
      tags,
      published,
      option1Name,
      sizes: parsedSizes,
      option2Name,
      colors,
      sku,
      dealerPrice,
      sellPrice,
      retailPrice,
      variantGrams,
      variantInventoryTracker,
      variantInventoryQty,
      variantInventoryPolicy,
      variantFulfillmentService,
      variantPrice,
      variantCompareAtPrice,
      variantRequiresShipping,
      images,
      images_urls,
      variantTaxable,
      variantBarcode,
      imagesPosition,
      imageAltTag,
      giftCard,
      seoTitle,
      seoDescription,
      googleShippingProductCategory,
      googleShoppingGender,
      googleShoppingAgeGender,
      googleShoppingMpn,
      googleShoppingCondition,
      ageGroup,
      careInstruction,
      careColor,
      fabric,
      targetGender,
      vehicleType,
      variantWeightUnit,
      variantTaxCode,
      costPerItem,
      includeUnitedStates,
      priceUnitedStates,
      product_space,
      originalPrice,
      discountPrice,
      csvStatus,
      status,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// export const updateData = async (req, res) => {
//   try {
//     const {
//       id,
//       name,
//       slug: csvSlug,
//       description,
//       vendor,
//       categoryId,
//       subCategoryId,
//       type,
//       tags,
//       published,
//       option1Name,
//       sizes,
//       option2Name,
//       colors,
//       sku,
//       variantGrams,
//       variantInventoryTracker,
//       variantInventoryQty,
//       variantInventoryPolicy,
//       variantFulfillmentService,
//       variantPrice,
//       variantCompareAtPrice,
//       variantRequiresShipping,
//       images_urls,
//       variantTaxable,
//       variantBarcode,
//       imagesPosition,
//       imageAltTag,
//       giftCard,
//       seoTitle,
//       seoDescription,
//       googleShippingProductCategory,
//       googleShoppingGender,
//       googleShoppingAgeGender,
//       googleShoppingMpn,
//       googleShoppingCondition,
//       ageGroup,
//       careInstruction,
//       careColor,
//       fabric,
//       targetGender,
//       vehicleType,
//       variantWeightUnit,
//       variantTaxCode,
//       costPerItem,
//       includeUnitedStates,
//       priceUnitedStates,
//       product_space,
//       originalPrice,
//       discountPrice,
//       csvStatus,
//     } = req.body;

//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found!",
//       });
//     }

//     // Handle uploaded images (if any)
//     let uploadedImages = product.images;
//     if (req.files && req.files.length > 0) {
//       uploadedImages = req.files.map((file) => ({
//         url: file.path,
//         publicId: file.filename,
//       }));
//     }

//     const slug = name.toLowerCase().split(" ").join("-");

//     const allData = {
//       name,
//       slug: csvSlug || slug,
//       description,
//       vendor,
//       categoryId,
//       subCategoryId: subCategoryId ? subCategoryId.split(",") : [],
//       type,
//       tags,
//       published,
//       option1Name,
//       sizes: typeof sizes === "string" ? JSON.parse(sizes) : sizes,
//       option2Name,
//       colors,
//       sku,
//       variantGrams,
//       variantInventoryTracker,
//       variantInventoryQty,
//       variantInventoryPolicy,
//       variantFulfillmentService,
//       variantPrice,
//       variantCompareAtPrice,
//       variantRequiresShipping,
//       images_urls,
//       variantTaxable,
//       variantBarcode,
//       imagesPosition,
//       imageAltTag,
//       giftCard,
//       seoTitle,
//       seoDescription,
//       googleShippingProductCategory,
//       googleShoppingGender,
//       googleShoppingAgeGender,
//       googleShoppingMpn,
//       googleShoppingCondition,
//       ageGroup,
//       careInstruction,
//       careColor,
//       fabric,
//       targetGender,
//       vehicleType,
//       variantWeightUnit,
//       variantTaxCode,
//       costPerItem,
//       includeUnitedStates,
//       priceUnitedStates,
//       product_space,
//       originalPrice,
//       discountPrice,
//       csvStatus,
//       status,
//       images_urls,
//       images: uploadedImages,
//     };

//     // Update product using spread operator
//     Object.assign(product, allData);

//     await product.save();
//     res.status(200).json({
//       success: true,
//       message: "Product updated successfully!",
//       product,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to update product!",
//     });
//   }
// };

export const updateData = async (req, res) => {
  try {
    const { id } = req.body; // only the product ID comes from the URL
    let updateData = { ...req.body };

    // Safely parse sizes if it's a JSON string
    if (typeof updateData.sizes === "string") {
      try {
        updateData.sizes = JSON.parse(updateData.sizes);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for sizes",
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

export const deleteData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid product ID!",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Delete associated images from Cloudinary
    if (product.images && product.images.length > 0) {
      try {
        await Promise.all(
          product.images.map(async (img) => {
            if (img.publicId) {
              await cloudinary.uploader.destroy(img.publicId);
            }
          })
        );
      } catch (cloudinaryError) {
        console.error(
          "Error deleting images from Cloudinary:",
          cloudinaryError.message
        );
        return res.status(500).json({
          success: false,
          message: "Failed to delete images from Cloudinary.",
          error: cloudinaryError.message,
        });
      }
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the product!",
    });
  }
};

// export const viewSingleProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a valid product ID!",
//       });
//     }

//     const product = await Product.findById(id)
//       .populate("categoryId")
//       .populate("subCategoryId");

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found.",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       payload: product,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "An error occurred while fetching the product!",
//     });
//   }
// };

export const viewSingleProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid product slug!",
      });
    }

    const product = await Product.findOne({ slug })
      .populate("categoryId")
      .populate("subCategoryId");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      payload: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching the product!",
    });
  }
};

// export const importJsonProducts = async (req, res) => {
//   try {
//     const products = req.body;

//     console.log(products, "products");

//     // Validate that the data is in the correct format
//     if (!Array.isArray(products)) {
//       return res
//         .status(400)
//         .json({ message: "Invalid data format. Expected an array." });
//     }

//     const finalProducts = [];

//     for (const product of products) {
//       console.log("Processing product:", product); // Log each product

//       // Destructure the product fields directly
//       const {
//         name,
//         slug,
//         label,
//         category,
//         subcategory,
//         description,
//         product_space,
//         originalPrice,
//         discountPrice = 0, // Default value if missing
//         shippingCost = 0, // Default value if missing
//         sizes = [], // Default to empty array if missing
//         images_urls = [], // Default to empty array if missing
//       } = product;

//       console.log({
//         name,
//         label,
//         category,
//         subcategory,
//         description,
//         product_space,
//         originalPrice,
//       }); // Log the destructured fields

//       // Validate required fields
//       if (
//         !name ||
//         !label ||
//         !category ||
//         !description ||
//         !product_space ||
//         !originalPrice
//       ) {
//         return res
//           .status(400)
//           .json({ message: `Missing required fields in product: ${name}` });
//       }

//       // Get Category and Subcategory IDs from DB
//       let categoryObj = await ProductCategory.findOne({ name: category });
//       if (!categoryObj) {
//         // If the category doesn't exist, create a new one
//         console.log(`Category not found: ${category}. Creating new category.`);
//         categoryObj = new ProductCategory({ name: category });
//         await categoryObj.save();
//         console.log(`New category created: ${category}`);
//       }

//       let subCategoryObj = await ProductSubCategory.findOne({
//         name: subcategory,
//       });
//       if (!subCategoryObj) {
//         // If the subcategory doesn't exist, create a new one
//         console.log(
//           `Subcategory not found: ${subcategory}. Creating new subcategory.`
//         );
//         subCategoryObj = new ProductSubCategory({
//           name: subcategory,
//           categoryId: categoryObj._id,
//         });
//         await subCategoryObj.save();
//         console.log(`New subcategory created: ${subcategory}`);
//       }

//       // Build final product object
//       const slugProduct = slugify(name, { lower: true });
//       const sku = `SKU-${uuidv4().slice(0, 8).toUpperCase()}`;

//       const newProduct = {
//         name,
//         slug: slugProduct,
//         label,
//         sku,
//         description,
//         product_space,
//         originalPrice,
//         discountPrice,
//         shippingCost,
//         categoryId: categoryObj._id,
//         subCategoryId: [subCategoryObj._id],
//         sizes,
//         images_urls,
//       };

//       finalProducts.push(newProduct);
//     }

//     // Insert into the database
//     const inserted = await Product.insertMany(finalProducts);

//     res.status(201).json({
//       success: true,
//       message: "Products imported successfully",
//       count: inserted.length,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error", error });
//   }
// };

export const importJsonProducts = async (req, res) => {
  try {
    const products = req.body;

    // Validate that the data is in the correct format
    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ message: "Invalid data format. Expected an array." });
    }

    const finalProducts = [];

    for (const product of products) {
      // Destructure the product fields directly
      const {
        name,
        slug = "",
        description,
        vendor,
        category,
        subcategory,
        type,
        tags,
        published,
        option1Name,
        sizes = [],
        option2Name,
        colors,
        sku,
        dealerPrice,
        sellPrice,
        retailPrice,
        variantGrams,
        variantInventoryTracker,
        variantInventoryQty,
        variantInventoryPolicy,
        variantFulfillmentService,
        variantPrice,
        variantCompareAtPrice,
        variantRequiresShipping,
        images_urls = [],
        variantTaxable,
        variantBarcode,
        imagesPosition,
        imageAltTag,
        giftCard,
        seoTitle,
        seoDescription,
        googleShippingProductCategory,
        googleShoppingGender,
        googleShoppingAgeGender,
        googleShoppingMpn,
        googleShoppingCondition,
        ageGroup,
        careInstruction,
        careColor,
        fabric,
        targetGender,
        vehicleType,
        variantWeightUnit,
        variantTaxCode,
        costPerItem,
        includeUnitedStates,
        priceUnitedStates,
        product_space,
        originalPrice,
        discountPrice,
        csvStatus,
        status,
      } = product;

      // Validate required fields
      // if (
      //   !name ||
      //   // !label ||
      //   !category ||
      //   !description ||
      //   // !product_space ||
      //   !originalPrice
      // ) {
      //   return res
      //     .status(400)
      //     .json({ message: `Missing required fields in product: ${name}` });
      // }

      // Get Category and Subcategory IDs from DB
      let categoryObj = await ProductCategory.findOne({ name: category });
      if (!categoryObj) {
        // If the category doesn't exist, create a new one
        const slugCategory = slugify(category, { lower: true }); // Generate slug for category
        categoryObj = new ProductCategory({
          name: category,
          slug: slugCategory,
        });
        await categoryObj.save();
      }

      let subCategoryObj = await ProductSubCategory.findOne({
        name: subcategory,
      });
      if (!subCategoryObj) {
        const slugSubCategory = slugify(subcategory, { lower: true });
        subCategoryObj = new ProductSubCategory({
          name: subcategory,
          slug: slugSubCategory,
          category: categoryObj._id,
        });
        await subCategoryObj.save();
      }

      // Build final product object
      const slugProduct = slugify(name, { lower: true });

      const newProduct = {
        name,
        slug: slugProduct,
        description,
        vendor,
        categoryId: categoryObj._id,
        subCategoryId: [subCategoryObj._id],
        type,
        tags,
        published,
        option1Name,
        sizes,
        option2Name,
        colors,
        sku,
        dealerPrice,
        sellPrice,
        retailPrice,
        variantGrams,
        variantInventoryTracker,
        variantInventoryQty,
        variantInventoryPolicy,
        variantFulfillmentService,
        variantPrice,
        variantCompareAtPrice,
        variantRequiresShipping,
        images_urls,
        variantTaxable,
        variantBarcode,
        imagesPosition,
        imageAltTag,
        giftCard,
        seoTitle,
        seoDescription,
        googleShippingProductCategory,
        googleShoppingGender,
        googleShoppingAgeGender,
        googleShoppingMpn,
        googleShoppingCondition,
        ageGroup,
        careInstruction,
        careColor,
        fabric,
        targetGender,
        vehicleType,
        variantWeightUnit,
        variantTaxCode,
        costPerItem,
        includeUnitedStates,
        priceUnitedStates,
        product_space,
        originalPrice,
        discountPrice,
        csvStatus,
        status,
      };

      finalProducts.push(newProduct);
    }

    // Insert into the database
    const inserted = await Product.insertMany(finalProducts);

    res.status(201).json({
      success: true,
      message: "Products imported successfully",
      count: inserted.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const updateImportJsonProducts = async (req, res) => {
  try {
    const products = req.body;

    // Validate that the data is in the correct format
    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ message: "Invalid data format. Expected an array." });
    }
    let updatedCount = 0;

    for (const product of products) {
      const { sku, dealerPrice, sellPrice, retailPrice, newSku, newSizes } =
        product;

      if (!sku) continue; // Skip if SKU is missing

      // Build dynamic update object only with provided price fields
      const updateFields = {};
      if (dealerPrice) updateFields.dealerPrice = dealerPrice;
      if (sellPrice) updateFields.sellPrice = sellPrice;
      // if (retailPrice) updateFields.retailPrice = retailPrice;
      updateFields.retailPrice = retailPrice || 0;
      if (newSku) updateFields.newSku = newSku;
      if (newSizes) updateFields.newSizes = newSizes;

      if (typeof updateData.newSizes === "string") {
        try {
          updateData.newSizes = JSON.parse(updateData.newSizes);
        } catch (parseError) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for newSizes",
          });
        }
      }
      if (Object.keys(updateFields).length === 0) continue; // Skip if no valid price fields

      const updated = await Product.updateOne(
        { sku },
        { $set: updateFields },
        { upsert: false } // Don't insert new documents
      );

      if (updated.modifiedCount > 0) {
        updatedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `${updatedCount} products updated successfully.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
