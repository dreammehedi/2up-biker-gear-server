import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Auth from "../models/Auth.model.js";

import dotenv from "dotenv";
import decrypt from "../helper/decrypt.js";
import EmailConfiguration from "../models/emailConfigurationModal.js";
dotenv.config();

// Register User
const registerUser = async (req, res) => {
  try {
    const { email, name, password, phone } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!email) missingFields.push("Email");
    if (!name) missingFields.push("User name");
    if (!password) missingFields.push("Password");
    if (!phone) missingFields.push("Phone");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Check if the user already exists by email or phone
    const existingUser = await Auth.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered with this email or phone number.",
      });
    }

    const salt = bcrypt.genSaltSync(10);

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create and save the new user
    const newUser = new Auth({
      email,
      name,
      password: hashedPassword,
    });
    const result = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ email: result.email }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    // Save the token in the database
    result.token = token;
    await result.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      payload: { _id: result._id, email, name, phone, token, role: "user" },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during registration.",
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!email) missingFields.push("Email");
    if (!password) missingFields.push("Password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }

    // Check if the user exists
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Verify the password
    let isMatch;
    if (user.email === "admin@gmail.com") {
      isMatch = password === user.password;
    } else {
      isMatch = bcrypt.compareSync(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    // Save the token in the database
    user.token = token;
    await user.save();

    // Send response excluding sensitive data
    const { _id, name, createdAt, role } = user;
    res.status(200).json({
      success: true,
      message: "Login successful.",
      payload: { _id, name, email, token, role, createdAt },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during login.",
    });
  }
};

// send reset code
const sendResetCode = async (email, code) => {
  const emailConfig = await EmailConfiguration.findOne();

  const decryptedPassword = decrypt(emailConfig?.emailPassword);
  if (!decryptedPassword) {
    throw new Error("Failed to decrypt email password");
  }
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailConfig?.emailAddress,
      pass: decryptedPassword,
    },
  });

  const mailOptions = {
    from: emailConfig[0]?.emailUserName,
    to: email,
    subject: "Password Reset Code",
    text: `Your password reset code is: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Could not send reset code email.");
  }
};

// Forgot Password Route
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Generate 6-digit code
    const resetCode = crypto.randomBytes(3).toString("hex");
    const resetCodeExpiration = Date.now() + 3600000;

    // Store the reset code and expiration time in the database
    user.resetCode = resetCode;
    user.resetCodeExpiration = resetCodeExpiration;
    await user.save();

    // Send reset code to user's email
    await sendResetCode(user.email, resetCode);

    res.status(200).json({
      success: true,
      message: "Reset code sent to your email.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while requesting password reset.",
    });
  }
};

// Reset Password Route
const resetPassword = async (req, res) => {
  const { email, resetCode, newPassword, confirmPassword } = req.body;

  try {
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Validate required fields
    const missingFields = [];
    if (!email) missingFields.push("Email");
    if (!resetCode) missingFields.push("Code");
    if (!newPassword) missingFields.push("New password");
    if (!confirmPassword) missingFields.push("Confirm password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password not match. Please try again.",
      });
    }

    // Check if the reset code matches and has not expired
    if (user.resetCode !== resetCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code.",
      });
    }

    if (user.resetCodeExpiration < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Reset code has expired.",
      });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hashSync(newPassword, 10);

    // Update the password in the database
    user.password = hashedPassword;
    user.resetCode = undefined; // Clear the reset code
    user.resetCodeExpiration = undefined; // Clear the expiration time
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during password reset.",
    });
  }
};

// logout
const logout = async (req, res) => {
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully." });
};

// admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!email) missingFields.push("Email");
    if (!password) missingFields.push("Password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} field(s) are required.`,
      });
    }

    // Check if the user exists
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Verify the password
    const isMatch = password === user.password;

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    // Save the token in the database
    user.token = token;
    await user.save();

    // Send response excluding sensitive data
    const { _id, name, createdAt, role } = user;
    res.status(200).json({
      success: true,
      message: "Login successful.",
      payload: { _id, name, email, token, role },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during login.",
    });
  }
};

// Get Admin
const getAdmin = async (req, res) => {
  try {
    const adminEmail = req.query.email;

    if (!adminEmail) {
      return res.status(400).json({
        success: false,
        message: "Admin email is required.",
      });
    }

    // Find the admin by the decoded ID
    const admin = await Auth.find({ email: adminEmail });

    const checkAdmin = admin[0]?.role === "admin";
    if (!checkAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }
    // Respond with the admin details
    res.status(200).json({
      success: true,
      payload: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching the admin.",
    });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const { email, ...otherFields } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email!",
      });
    }

    const data = await Auth.findOne({ email });

    if (!data || data.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin not found!",
      });
    }

    let updatedFields = {
      ...otherFields,
    };
    if (req.file) {
      try {
        if (data.imagePublicId) {
          await cloudinary.uploader.destroy(data.imagePublicId);
        }
        const cloudinaryResult = req.file;

        // Add the new image data to updated fields
        updatedFields.image = cloudinaryResult.path;
        updatedFields.imagePublicId = cloudinaryResult.filename;
      } catch (imageError) {
        return res.status(500).json({
          success: false,
          message: "Image update failed.",
          error: imageError.message,
        });
      }
    }

    await Auth.findOneAndUpdate({ email }, updatedFields, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while updating the admin profile!",
    });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const { old_password, new_password, password_confirmation, email } =
      req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email!",
      });
    }

    if (!old_password || !new_password || !password_confirmation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long!",
      });
    }

    if (new_password !== password_confirmation) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation password do not match!",
      });
    }

    // Find admin
    const data = await Auth.findOne({ email });

    if (!data || data.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin not found!",
      });
    }

    // Compare old password
    const isMatch = old_password === data?.password;
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect!",
      });
    }

    // Update password
    await Auth.findOneAndUpdate(
      { email },
      { password: new_password },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Admin password changed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while changing the admin password.",
    });
  }
};

export {
  adminLogin,
  changeAdminPassword,
  forgotPassword,
  getAdmin,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  updateAdminProfile,
};
