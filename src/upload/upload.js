import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.config.js";

// Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "2up-biker-gear",
    allowed_formats: [
      "jpeg",
      "png",
      "gif",
      "svg",
      "mp4",
      "avi",
      "mov",
      "mkv",
      "pdf",
    ],
    resource_type: "auto",
  },
});

// Initialize Multer
const upload = multer({ storage });

export { upload };
