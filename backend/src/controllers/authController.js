import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "../utils/emailService.js";
import mongoose from "mongoose";
import crypto from "crypto";

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register new user - Step 1: Create OTP record
export const register = async (req, res) => {
  console.log("📝 Register request received:", req.body);

  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`🔑 Generated OTP: ${otp} for email: ${email}`);

    // Set OTP expiration (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Delete any existing OTP records for this email
    await OTP.deleteMany({ email });

    // Create new OTP record
    const otpRecord = new OTP({
      email,
      name,
      password,
      otp,
      expiresAt,
    });

    await otpRecord.save();
    console.log("✅ OTP record saved to database");

    // Send OTP email
    const emailResult = await sendOTPEmail(email, name, otp);

    if (!emailResult.success) {
      console.error("❌ Failed to send OTP email:", emailResult.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again.",
      });
    }

    console.log("✅ OTP email sent successfully");

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      email,
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// Verify OTP and complete registration
export const verifyOTP = async (req, res) => {
  console.log("🔍 Verify OTP request received:", req.body);

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No verification found for this email. Please register again.",
      });
    }

    // Check if OTP has expired
    const now = new Date();
    if (now > otpRecord.expiresAt) {
      await OTP.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please register again.",
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      // Increment attempts counter
      otpRecord.attempts += 1;

      // If too many failed attempts (e.g., 5)
      if (otpRecord.attempts >= 5) {
        await OTP.deleteOne({ email });
        return res.status(400).json({
          success: false,
          message: "Too many failed attempts. Please register again.",
        });
      }

      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please try again.",
      });
    }

    // OTP is valid, create user
    const newUser = new User({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password, // This is already hashed in the OTP model
    });

    const savedUser = await newUser.save();
    console.log("✅ User created successfully:", savedUser._id);

    // Delete OTP record
    await OTP.deleteOne({ email });

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      data: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  console.log("🔄 Resend OTP request received:", req.body);

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find existing OTP record
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No registration in progress. Please register again.",
      });
    }

    // Check if OTP was recently resent (e.g., within the last 60 seconds)
    const now = new Date();
    if (otpRecord.lastResendAt && now - otpRecord.lastResendAt < 60000) {
      return res.status(400).json({
        success: false,
        message: "Please wait at least 60 seconds before requesting a new code",
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    console.log(`🔑 Generated new OTP: ${newOTP} for email: ${email}`);

    // Update OTP record
    otpRecord.otp = newOTP;
    otpRecord.expiresAt = new Date(now.getTime() + 10 * 60000); // 10 minutes from now
    otpRecord.attempts = 0;
    otpRecord.lastResendAt = now;

    await otpRecord.save();
    console.log("✅ OTP record updated");

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otpRecord.name, newOTP);

    if (!emailResult.success) {
      console.error("❌ Failed to send OTP email:", emailResult.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again.",
      });
    }

    console.log("✅ OTP email resent successfully");

    res.status(200).json({
      success: true,
      message: "New verification code sent to your email",
    });
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending verification code",
    });
  }
};

// Login user
export const login = async (req, res) => {
  console.log("🔑 Login request received:", { email: req.body.email });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "30d" }
    );

    console.log("✅ Login successful for user:", user._id);

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};
