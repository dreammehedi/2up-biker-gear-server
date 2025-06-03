import express from "express";
import {
  addData,
  deleteData,
  getData,
  getProductCartsData,
  importJsonProducts,
  updateData,
  updateImportJsonProducts,
  viewSingleProduct,
} from "../controllers/Product.controller.js";
import paginationMiddleware from "../middlewares/pagination.middleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../upload/upload.js";

const ProductRouter = express.Router();

ProductRouter.get("/product", paginationMiddleware, getData);
ProductRouter.get("/product-carts", getProductCartsData);

ProductRouter.post(
  "/add-product",
  verifyToken,
  upload.array("images", 5),
  addData
);

ProductRouter.post("/import-product-json", verifyToken, importJsonProducts);
ProductRouter.patch(
  "/update-import-product-json",
  verifyToken,
  updateImportJsonProducts
);

ProductRouter.patch(
  "/update-product",
  verifyToken,
  upload.array("images", 5),
  updateData
);

ProductRouter.delete("/delete-product/:id", verifyToken, deleteData);
ProductRouter.get("/view-product/:slug", viewSingleProduct);

export default ProductRouter;
