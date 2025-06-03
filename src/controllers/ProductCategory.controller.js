import {
  ProductCategory,
  ProductSubCategory,
} from "../models/Category.model.js";
import Product from "../models/product.model.js";

export const getAllCategoriesFrontend = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const totalProductCategories = await ProductCategory.countDocuments();
    const categories = await ProductCategory.find()
      .skip(skip)
      .limit(limit)
      .lean();
    const subCategories = await ProductSubCategory.find().lean();

    const categoryData = categories.map((category) => {
      const subCategoriesForCategory = subCategories
        .filter((sub) => sub.category?.toString() === category._id.toString())
        .map((sub) => ({ ...sub }));
      return { ...category, subCategories: subCategoriesForCategory };
    });

    const pagination = (totalData, page, limit) => ({
      totalData,
      totalPages: Math.ceil(totalData / limit),
      currentPage: page,
      limit,
    });

    res.status(200).json({
      success: true,
      payload: {
        productCategories: {
          data: categoryData,
          pagination: pagination(totalProductCategories, page, limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getData = async (req, res) => {
  try {
    const { skip, limit } = req.pagination;
    const search = req.query.search || "";
    const searchRegex = new RegExp(search, "i");

    let query = { $or: [{ name: searchRegex }] };

    const data = await ProductCategory.find(query).skip(skip).limit(limit);
    const totalDataCount = await ProductCategory.countDocuments(query);

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

export const getCategoriesFrontend = async (req, res) => {
  try {
    const data = await ProductCategory.find().limit(8);

    res.status(200).json({
      success: true,
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getTypesFrontend = async (req, res) => {
  try {
    // Fetch all products
    const products = await Product.find().lean();

    // Extract unique product types
    const typeSet = new Set();
    const uniqueTypes = [];

    for (const product of products) {
      if (product.type && !typeSet.has(product.type)) {
        typeSet.add(product.type);
        uniqueTypes.push({
          name: product.type,
          slug: product.type.toLowerCase().replace(/\s+/g, "-"),
        });
      }
    }

    // Return types and products
    res.status(200).json({
      success: true,
      payload: {
        types: uniqueTypes,
      },
      totalData: uniqueTypes?.length,
    });
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addData = async (req, res) => {
  try {
    const { name, content } = req.body;
    const slug = name.toLowerCase().split(" ").join("-");
    const missingFields = [];
    if (!name) missingFields.push("Name");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }

    // const existingData = await ProductCategory.findOne({ name: name.trim() });
    // if (existingData) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Name already exists.",
    //   });
    // }

    const newData = new ProductCategory({
      name,
      slug,
      content,
      status: 1,
    });

    await newData.save();

    res.status(201).json({
      success: true,
      message: "Data added successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add data!",
    });
  }
};

export const updateData = async (req, res) => {
  try {
    const { id, name, ...otherFields } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await ProductCategory.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found!",
      });
    }

    // if (name && name.trim() !== data.name) {
    //   const existingData = await ProductCategory.findOne({
    //     name: name.trim(),
    //   });
    //   if (existingData) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Name already exists!",
    //     });
    //   }
    // }

    let updatedFields = { ...otherFields };
    if (name) {
      updatedFields.name = name.trim();
      updatedFields.slug = name.toLowerCase().split(" ").join("-");
    }

    await ProductCategory.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({
      success: true,
      message: "Data updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the data!",
    });
  }
};

export const deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Please provide valid ID!",
      });
    }

    const data = await ProductCategory.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found.",
      });
    }

    await ProductCategory.findByIdAndDelete(id);

    res.json({ success: true, message: "Data deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the data!",
    });
  }
};

export const categoryBaseSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const categoryExists = await ProductCategory.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subCategories = await ProductSubCategory.find({
      category: categoryId,
    }).populate("category");
    res.status(200).json(subCategories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
