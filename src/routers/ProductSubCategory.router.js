import express from "express";
import {
  addData,
  deleteData,
  getCategoriesFrontend,
  getData,
  updateData,
} from "../controllers/ProductSubCategory.controller.js";
import paginationMiddleware from "../middlewares/pagination.middleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../upload/upload.js";

const ProductSubCategoryRouter = express.Router();

ProductSubCategoryRouter.get(
  "/all-product-sub-categories",
  getCategoriesFrontend
);

ProductSubCategoryRouter.get(
  "/product-sub-categories",
  verifyToken,
  paginationMiddleware,
  getData
);

ProductSubCategoryRouter.post(
  "/add-product-sub-categories",
  verifyToken,
  upload.single("image"),
  addData
);

ProductSubCategoryRouter.patch(
  "/update-product-sub-categories",
  verifyToken,
  upload.single("image"),
  updateData
);

ProductSubCategoryRouter.delete(
  "/delete-product-sub-categories/:id",
  verifyToken,
  deleteData
);

export default ProductSubCategoryRouter;
