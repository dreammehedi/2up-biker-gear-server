import express from "express";
import multer from "multer";
import {
  getEmailConfiguration,
  updateEmailConfiguration,
} from "../controllers/emailConfiguration.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
const upload = multer();
const EmailConfigurationRouter = express.Router();

EmailConfigurationRouter.get("/email-configuration", getEmailConfiguration);

EmailConfigurationRouter.patch(
  "/update-email-configuration",
  verifyToken,
  upload.none(),
  updateEmailConfiguration
);

export default EmailConfigurationRouter;
