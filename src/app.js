import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import createHttpError from "http-errors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import AboutUsRouter from "./routers/aboutUs.router.js";
import AuthRouter from "./routers/auth.router.js";
import BlogRouter from "./routers/Blog.router.js";
import BlogCategoryRouter from "./routers/BlogCategory.router.js";
import ContactUserRouter from "./routers/contactUser.router.js";
import CouponRouter from "./routers/coupon.router.js";
import EmailConfigurationRouter from "./routers/emailConfiguration.router.js";
import HeroBannerSliderRouter from "./routers/HeroBannerSlider.router.js";
import OrderRouter from "./routers/Order.router.js";
import ProductRouter from "./routers/Product.router.js";
import ProductCategoryRouter from "./routers/ProductCategory.router.js";
import ProductSubCategoryRouter from "./routers/ProductSubCategory.router.js";
import ReturnRouter from "./routers/return.router.js";
import ShippingCostRouter from "./routers/ShippingCost.router.js";
import SiteConfigurationRouter from "./routers/siteConfiguration.router.js";
const app = express();
// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Adjust the path if necessary

// middleware
app.use(express.json());

// Rate limiting configuration
const limiterApi = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 100, // max 100 requests 2 minutes
  message: "Too many requests from this IP, Please Try Again Later!",
});

// Middleware setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5000",
      "https://2up-biker-gear-frontend.vercel.app",
      "https://2up-biker-gear-admin.vercel.app",
      "https://2up-biker-gear-server.vercel.app",
      "https://twoupbikergear.com",
      "https://www.twoupbikergear.com",
      "http://www.twoupbikergear.com",
      "http://twoupbikergear.com",
      "http://www.twoupbikergear.com",
      "https://2up-biker-gear-frontend-three.vercel.app",
   ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(limiterApi);

// Home route
app.get("/", (req, res) => {
  res.render("index", { title: "Home", message: "Welcome to 2UP Biker Gear!" });
});

// All router middleware
app.use("/api", AuthRouter);
app.use("/api", SiteConfigurationRouter);
app.use("/api", EmailConfigurationRouter);
app.use("/api", HeroBannerSliderRouter);
app.use("/api", AboutUsRouter);
app.use("/api", ReturnRouter);
app.use("/api", ProductCategoryRouter);
app.use("/api", ProductSubCategoryRouter);
app.use("/api", BlogCategoryRouter);
app.use("/api", CouponRouter);
app.use("/api", BlogRouter);
app.use("/api", ProductRouter);
app.use("/api", OrderRouter);
app.use("/api", ContactUserRouter);
app.use("/api", ShippingCostRouter);

// 404 Not Found Handler
app.use((req, res, next) => {
  next(createHttpError(404, "Not Found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error!",
  });
});

export default app;

