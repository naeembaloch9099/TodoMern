import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import process from "process";
import connectDB from "./src/config/database.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Server is working!",
    timestamp: new Date().toISOString(),
  });
});

// Basic auth test route
app.post("/test/register", async (req, res) => {
  try {
    console.log("=== REGISTRATION REQUEST START ===");
    console.log("Request received at:", new Date().toISOString());
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Import User model here to avoid issues
    console.log("Importing User model...");
    const User = (await import("./src/models/userModel.js")).default;
    console.log("User model imported successfully");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if user exists
    console.log("Checking if user exists with email:", email);
    const existingUser = await User.findOne({ email });
    console.log(
      "Existing user check result:",
      existingUser ? "User found" : "No user found"
    );

    if (existingUser) {
      console.log("User already exists, returning error");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    console.log("Creating new user with data:", {
      name,
      email,
      password: "***",
    });
    const user = await User.create({
      name,
      email,
      password,
    });
    console.log("User creation successful, ID:", user._id);

    console.log("User created successfully:", user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("=== REGISTRATION ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=========================");

    try {
      res.status(500).json({
        success: false,
        message: "Error creating user",
        error: error.message,
      });
    } catch (resError) {
      console.error("Error sending response:", resError);
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`Test endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/test`);
  console.log(`  POST http://localhost:${PORT}/test/register`);
});
