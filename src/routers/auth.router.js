import express from "express";
import multer from "multer";
import {
  adminLogin,
  changeAdminPassword,
  forgotPassword,
  getAdmin,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  updateAdminProfile,
} from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
const AuthRouter = express.Router();

const upload = multer();

AuthRouter.post("/register", upload.none(), registerUser);
AuthRouter.post("/login", upload.none(), loginUser);
AuthRouter.post("/forgot-password", upload.none(), forgotPassword);
AuthRouter.post("/reset-password", upload.none(), resetPassword);
AuthRouter.post("/logout", upload.none(), verifyToken, logout);
AuthRouter.post("/admin-login", upload.none(), adminLogin);
AuthRouter.get("/admin", verifyToken, getAdmin);
AuthRouter.patch(
  "/admin-update-profile",
  verifyToken,
  upload.single("image"),
  updateAdminProfile
);
AuthRouter.patch(
  "/admin-change-password",
  verifyToken,
  upload.none(),
  changeAdminPassword
);
export default AuthRouter;
