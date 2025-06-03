import express from "express";
import { checkZipCode } from "../controllers/ShippingCost.controller.js";

const ShippingCostRouter = express.Router();

ShippingCostRouter.post("/check-zip-code", checkZipCode);

export default ShippingCostRouter;
