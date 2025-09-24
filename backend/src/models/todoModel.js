import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Todo text is required"],
    trim: true,
  },
  dueDate: {
    type: String,
    default: "",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  category: {
    type: String,
    default: "general",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for faster querying by userId
todoSchema.index({ userId: 1 });

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;
