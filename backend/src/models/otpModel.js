import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  lastResendAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
otpSchema.pre("save", async function (next) {
  const otp = this;

  // Only hash if password is modified
  if (!otp.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    otp.password = await bcrypt.hash(otp.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
