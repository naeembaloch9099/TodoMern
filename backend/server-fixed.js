import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import User from "./src/models/userModel.js";
import Todo from "./src/models/todoModel.js";
import OTP from "./src/models/otpModel.js";
import { sendOTPEmail, sendWelcomeEmail } from "./src/services/emailService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`
  );
  next();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err.message);
  });

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// OTP Routes
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    console.log("📧 Send OTP request received:", req.body);
    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    console.log(`🔢 Generated OTP: ${otp} for email: ${email}`);

    // Store OTP in database
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        email: email.toLowerCase(),
        name,
        password,
        otp,
        expiresAt,
        verified: false,
        attempts: 0,
      },
      { upsert: true, new: true }
    );

    console.log("💾 OTP stored in database");

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, name, otp);

    if (emailResult.success) {
      console.log("✅ OTP email sent successfully");
      res.json({
        success: true,
        message: "OTP sent successfully to your email",
      });
    } else {
      console.error("❌ Failed to send email:", emailResult.error);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
    });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    console.log("🔐 Verify OTP request received:", req.body);
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });
    console.log("🔍 Found OTP record:", otpRecord ? "Yes" : "No");

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email. Please request a new one.",
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      console.log("⏰ OTP expired");
      await OTP.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      console.log("🚫 Too many attempts");
      await OTP.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      console.log("❌ OTP mismatch");
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`,
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    console.log("✅ OTP verified successfully");
    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying OTP",
    });
  }
});

app.post("/api/auth/resend-otp", async (req, res) => {
  try {
    console.log("🔄 Resend OTP request received:", req.body);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find existing OTP record
    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No signup process found for this email",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log(`🔢 Generated new OTP: ${otp} for email: ${email}`);

    // Update OTP record
    otpRecord.otp = otp;
    otpRecord.expiresAt = expiresAt;
    otpRecord.verified = false;
    otpRecord.attempts = 0;
    await otpRecord.save();

    // Send new OTP
    const emailResult = await sendOTPEmail(email, otpRecord.name, otp);

    if (emailResult.success) {
      console.log("✅ New OTP email sent successfully");
      res.json({
        success: true,
        message: "New OTP sent successfully",
      });
    } else {
      console.error("❌ Failed to resend email:", emailResult.error);
      res.status(500).json({
        success: false,
        message: "Failed to resend OTP email",
      });
    }
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending OTP",
    });
  }
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("👤 Register request received:", req.body);
    const { email } = req.body;

    // Check if OTP was verified
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      verified: true,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Email not verified. Please verify your email first.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await OTP.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user with data from OTP record
    const user = new User({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password,
    });

    await user.save();

    // Clean up OTP record
    await OTP.deleteOne({ email: email.toLowerCase() });

    // Send welcome email
    await sendWelcomeEmail(email, otpRecord.name);

    console.log("✅ User registered successfully");
    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to MyTodo App!",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login request received:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("✅ Login successful");
    res.json({
      success: true,
      message: "Welcome to MyApp",
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
});

// Todo Routes
app.get("/api/todos", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const todos = await Todo.find({ user: userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: todos,
    });
  } catch (error) {
    console.error("❌ Get todos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch todos",
    });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    const { text, dueDate, userId } = req.body;

    if (!text || !userId) {
      return res.status(400).json({
        success: false,
        message: "Text and user ID are required",
      });
    }

    const todo = new Todo({
      text,
      dueDate: dueDate || null,
      user: userId,
      completed: false,
      priority: "medium",
    });

    await todo.save();

    res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: todo,
    });
  } catch (error) {
    console.error("❌ Create todo error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create todo",
    });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const todo = await Todo.findOneAndDelete({ _id: id, user: userId });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    res.json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete todo error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete todo",
    });
  }
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:5173`);
  console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
