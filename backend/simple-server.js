import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import process from "process";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB manually
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined");
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
}

// Simple user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

// Connect to database
connectDB();

// Simple test route
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Server is working!",
    timestamp: new Date().toISOString(),
  });
});

// Basic registration route
app.post("/test/register", async (req, res) => {
  try {
    console.log("=== REGISTRATION REQUEST START ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if user exists
    console.log("Checking if user exists...");
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    console.log("Creating new user...");
    const user = await User.create({
      name,
      email,
      password, // Note: In real app, this should be hashed
    });

    console.log("✅ User created successfully:", user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
});

// Route to list all users (for verification)
app.get("/test/users", async (req, res) => {
  try {
    const users = await User.find({}, "name email createdAt").sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`Test endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/test`);
  console.log(`  POST http://localhost:${PORT}/test/register`);
  console.log(`  GET  http://localhost:${PORT}/test/users`);
});
