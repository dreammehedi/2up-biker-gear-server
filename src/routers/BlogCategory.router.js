import express from "express";
import {
  addData,
  deleteData,
  getAllCategoriesFrontend,
  getBlogCategoriesFrontend,
  getData,
  updateData,
} from "../controllers/BlogCategory.controller.js";
import paginationMiddleware from "../middlewares/pagination.middleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../upload/upload.js";

const BlogCategoryRouter = express.Router();

BlogCategoryRouter.get("/get-all-blog-categories", getAllCategoriesFrontend);
BlogCategoryRouter.get("/all-blog-categories", getBlogCategoriesFrontend);

BlogCategoryRouter.get(
  "/blog-categories",
  verifyToken,
  paginationMiddleware,
  getData
);

BlogCategoryRouter.post(
  "/add-blog-categories",
  verifyToken,
  upload.single("image"),
  addData
);

BlogCategoryRouter.patch(
  "/update-blog-categories",
  verifyToken,
  upload.single("image"),
  updateData
);

BlogCategoryRouter.delete(
  "/delete-blog-categories/:id",
  verifyToken,
  deleteData
);

export default BlogCategoryRouter;
