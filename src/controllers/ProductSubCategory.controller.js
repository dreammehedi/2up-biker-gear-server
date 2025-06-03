import cloudinary from "../config/cloudinary.config.js";
import {
  ProductCategory,
  ProductSubCategory,
} from "../models/Category.model.js";

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

    const data = await ProductSubCategory.find(query)
      .skip(skip)
      .limit(limit)
      .populate("category"); // Correct field name

    const totalDataCount = await ProductSubCategory.countDocuments(query);

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
    const data = await ProductSubCategory.find();

    res.status(200).json({
      success: true,
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addData = async (req, res) => {
  try {
    const { name, category } = req.body;
    const missingFields = [];

    if (!name) missingFields.push("Name");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }

    // const existingData = await ProductSubCategory.findOne({
    //   name: name.trim(),
    // });
    // if (existingData) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Name already exists.",
    //   });
    // }

    // Check image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required!",
      });
    }

    // Validate file type (JPG, PNG)
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only JPG and PNG images are allowed!",
      });
    }

    // Generate slug
    const slug = name.toLowerCase().split(" ").join("-");

    // Create and save data
    const newData = new ProductSubCategory({
      name: name.trim(),
      category,
      slug,
      image: req.file.path,
      imagePublicId: req.file.filename,
      status: 1,
    });

    await newData.save();

    return res.status(201).json({
      success: true,
      message: "Data added successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
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

    const data = await ProductSubCategory.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found!",
      });
    }

    // if (name && name.trim() !== data.name) {
    //   const existingData = await ProductSubCategory.findOne({
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

    if (req.file) {
      try {
        if (data.imagePublicId) {
          await cloudinary.uploader.destroy(data.imagePublicId);
        }
        const cloudinaryResult = req.file;

        // Add the new image data to updated fields
        updatedFields.image = cloudinaryResult.path;
        updatedFields.imagePublicId = cloudinaryResult.filename;
      } catch (imageError) {
        return res.status(500).json({
          success: false,
          message: "Image update failed.",
          error: imageError.message,
        });
      }
    }

    await ProductSubCategory.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

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

    const data = await ProductSubCategory.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found.",
      });
    }

    if (data.image) {
      const publicId = data.imagePublicId;

      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error(
          "Error deleting image from Cloudinary:",
          cloudinaryError.message
        );
        return res.status(500).json({
          success: false,
          message: "Failed to delete image from Cloudinary.",
          error: cloudinaryError.message,
        });
      }
    }

    await ProductSubCategory.findByIdAndDelete(id);

    res.json({ success: true, message: "Data deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the data!",
    });
  }
};
