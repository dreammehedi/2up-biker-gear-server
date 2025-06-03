import { Coupon } from "../models/coupon.model.js";

export const getDataFrontend = async (req, res) => {
  try {
    const couponCode = req.body.code;
    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    const data = await Coupon.findOne({ code: couponCode });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    res.status(200).json({
      success: true,
      payload: data,
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

    const query = {
      $or: [{ code: searchRegex }, { discountType: searchRegex }],
    };

    const data = await Coupon.find(query).skip(skip).limit(limit);
    const totalDataCount = await Coupon.countDocuments(query);

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
    const { code, discountPrice } = req.body;

    const missingFields = [];
    if (!code) missingFields.push("Name");
    if (!discountPrice) missingFields.push("Discount price");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }

    const existingData = await Coupon.findOne({ code: code.trim() });
    if (existingData) {
      return res.status(400).json({
        success: false,
        message: "Code already exists.",
      });
    }

    const newData = new Coupon({
      code,
      discountPrice,
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
    const { id, code, ...otherFields } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await Coupon.findById(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found!",
      });
    }

    if (code && code.trim() !== data.code) {
      const existingData = await Coupon.findOne({ code: code.trim() });
      if (existingData) {
        return res.status(400).json({
          success: false,
          message: "Code already exists!",
        });
      }
    }

    const updatedFields = { ...otherFields };
    if (code) updatedFields.code = code.trim();

    await Coupon.findByIdAndUpdate(id, updatedFields, { new: true });

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

    const data = await Coupon.findById(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found.",
      });
    }

    await Coupon.findByIdAndDelete(id);

    res.json({ success: true, message: "Data deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the data!",
    });
  }
};
