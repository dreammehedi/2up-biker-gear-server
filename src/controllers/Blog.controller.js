import cloudinary from "../config/cloudinary.config.js";
import Blog from "../models/blog.model.js";
import { BlogCategory } from "../models/Category.model.js";

export const getRelatedData = async (req, res) => {
  try {
    const { categories } = req.query;

    // Ensure categories is an array
    const categoryArray = Array.isArray(categories)
      ? categories
      : categories?.split(",");

    if (!categoryArray || categoryArray.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No categories provided" });
    }

    // Find category IDs by name
    const matchedCategories = await BlogCategory.find({
      slug: { $in: categoryArray },
    });

    const categoryIds = matchedCategories.map((cat) => cat._id);

    const data = await Blog.find({
      category: { $in: categoryIds },
    }).populate("category");

    res.status(200).json({
      success: true,
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPopularData = async (req, res) => {
  try {
    const { skip, limit } = req.pagination;
    const search = req.query.search || "";
    const searchRegex = new RegExp(search, "i");

    // Base query: only popular blogs
    let query = { isPopular: true };

    // If search is provided, add title filter
    if (search) {
      query.title = searchRegex;
    }

    const data = await Blog.find(query)
      .skip(skip)
      .limit(limit)
      .populate("category");

    const totalDataCount = await Blog.countDocuments(query);

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

export const getData = async (req, res) => {
  try {
    const { skip, limit } = req.pagination;
    const search = req.query.search || "";
    const searchRegex = new RegExp(search, "i");

    let query = {
      $or: [{ title: searchRegex }],
    };

    const data = await Blog.find(query)
      .skip(skip)
      .limit(limit)
      .populate("category");
    const totalDataCount = await Blog.countDocuments(query);

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
      title,
      description,
      content,
      isPopular,
      addedBy,
      addedDate,
      category, // this can be an array
    } = req.body;

    const slug = title?.toLowerCase().split(" ").join("-");

    // Validate required fields
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (!content) missingFields.push("content");
    if (!isPopular) missingFields.push("isPopular");
    if (!addedBy) missingFields.push("addedBy");
    if (!addedDate) missingFields.push("added date");
    if (!category || category.length === 0) missingFields.push("category");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }

    // Check image file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required!",
      });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only JPG and PNG images are allowed!",
      });
    }

    const newData = new Blog({
      title,
      slug,
      description,
      content,
      isPopular,
      addedBy,
      addedDate,
      category: Array.isArray(category) ? category : [category],
      image: req.file.path,
      imagePublicId: req.file.filename,
      status: 1,
    });

    await newData.save();

    res.status(201).json({
      success: true,
      message: "Blog post added successfully.",
      data: newData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add blog post!",
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

    const data = await Blog.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found!",
      });
    }

    // if (name && name.trim() !== data.name) {
    //   const existingData = await Blog.findOne({
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
    await Blog.findByIdAndUpdate(id, updatedFields, { new: true });

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

    const data = await Blog.findById(id);

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
    await Blog.findByIdAndDelete(id);

    res.json({ success: true, message: "Data deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the data!",
    });
  }
};

export const viewSingleBlog = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid blog slug!",
      });
    }

    const blog = await Blog.findOne({ slug }).populate("category");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    res.status(200).json({
      success: true,
      payload: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching the blog!",
    });
  }
};
