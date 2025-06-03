import express from "express";
import { getData, updateData } from "../controllers/Return.controller.js";

import verifyToken from "../middlewares/verifyToken.js";
import { upload } from "../upload/upload.js";

const ReturnRouter = express.Router();

ReturnRouter.get("/return-page", getData);
ReturnRouter.patch(
  "/update-return-page",
  verifyToken,
  upload.none(),
  updateData
);

export default ReturnRouter;
