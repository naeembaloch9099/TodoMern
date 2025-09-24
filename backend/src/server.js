import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import process from "process";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import { protect } from "./middleware/auth.js";
import { testEmailConfig } from "./utils/emailService.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todo-app")
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Connection state: ${mongoose.connection.readyState}`);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Test email configuration at startup
testEmailConfig()
  .then((result) => {
    if (result.success) {
      console.log("✅ Email service configured correctly");
    } else {
      console.error("⚠️ Email service configuration issue:", result.error);
    }
  })
  .catch((error) => {
    console.error("❌ Failed to test email configuration:", error);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", protect, todoRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "up",
    time: new Date(),
    mongoConnection:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
