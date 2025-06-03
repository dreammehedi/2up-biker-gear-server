import express from "express";
import {
  addData,
  categoryBaseSubCategory,
  deleteData,
  getAllCategoriesFrontend,
  getCategoriesFrontend,
  getData,
  getTypesFrontend,
  updateData,
} from "../controllers/ProductCategory.controller.js";
import paginationMiddleware from "../middlewares/pagination.middleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../upload/upload.js";

const ProductCategoryRouter = express.Router();

ProductCategoryRouter.get(
  "/get-all-product-categories",
  getAllCategoriesFrontend
);

ProductCategoryRouter.get("/all-product-categories", getCategoriesFrontend);
ProductCategoryRouter.get("/all-product-types", getTypesFrontend);

ProductCategoryRouter.get("/product-categories", paginationMiddleware, getData);

ProductCategoryRouter.post(
  "/add-product-categories",
  verifyToken,
  upload.single("image"),
  addData
);

ProductCategoryRouter.patch(
  "/update-product-categories",
  verifyToken,
  upload.single("image"),
  updateData
);

ProductCategoryRouter.delete(
  "/delete-product-categories/:id",
  verifyToken,
  deleteData
);

ProductCategoryRouter.get(
  "/get-product-categories/:categoryId/product-sub-categories",
  categoryBaseSubCategory
);

export default ProductCategoryRouter;
