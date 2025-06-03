import cloudinary from "../config/cloudinary.config.js";
import AboutUs from "../models/aboutUs.model.js";

const getData = async (req, res) => {
  try {
    const data = await AboutUs.find();
    res.status(200).json({
      success: true,
      payload: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateData = async (req, res) => {
  try {
    const { id, ...otherFields } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ID!",
      });
    }

    const data = await AboutUs.findById(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found!",
      });
    }

    let updatedFields = { ...otherFields };

    if (req.file) {
      const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
      const uploadedFile = req.file;

      // Check file type
      if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Only JPG and PNG image formats are allowed!",
        });
      }

      try {
        if (data.imagePublicId) {
          await cloudinary.uploader.destroy(data.imagePublicId);
        }
        updatedFields.image = uploadedFile.path;
        updatedFields.imagePublicId = uploadedFile.filename;
      } catch (fileError) {
        return res.status(500).json({
          success: false,
          message: "File upload failed.",
          error: fileError.message,
        });
      }
    }

    const updatedData = await AboutUs.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Data updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the data!",
    });
  }
};

// export { addData, getData, updateData };
export { getData, updateData };
