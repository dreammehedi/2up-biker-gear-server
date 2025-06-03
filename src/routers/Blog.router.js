import express from "express";
import {
  addData,
  deleteData,
  getData,
  getPopularData,
  getRelatedData,
  updateData,
  viewSingleBlog,
} from "../controllers/Blog.controller.js";
import paginationMiddleware from "../middlewares/pagination.middleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../upload/upload.js";

const BlogRouter = express.Router();

BlogRouter.get("/blog", paginationMiddleware, getData);

BlogRouter.get("/popular-blog", paginationMiddleware, getPopularData);
BlogRouter.get("/related-blog", getRelatedData);

BlogRouter.post("/add-blog", verifyToken, upload.single("image"), addData);

BlogRouter.patch(
  "/update-blog",
  verifyToken,
  upload.single("image"),
  updateData
);

BlogRouter.delete("/delete-blog/:id", verifyToken, deleteData);
BlogRouter.get("/view-blog/:slug", viewSingleBlog);

export default BlogRouter;
