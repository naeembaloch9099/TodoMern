import Todo from "../models/todoModel.js";
import mongoose from "mongoose";

// Get all todos for a user
export const getTodos = async (req, res) => {
  console.log("🔍 Getting todos for user:", req.query.userId);

  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Verify the requesting user can access these todos
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these todos",
      });
    }

    const todos = await Todo.find({ userId });
    console.log(`✅ Found ${todos.length} todos for user`);

    res.json({
      success: true,
      data: todos,
    });
  } catch (error) {
    console.error("❌ Get todos error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Create a new todo
export const createTodo = async (req, res) => {
  try {
    const { text, dueDate, userId, priority, category, completed } = req.body;
    console.log("📝 Creating todo:", req.body);

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Todo text is required",
      });
    }

    // Ensure the user can only create todos for themselves
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create todos for this user",
      });
    }

    const todo = new Todo({
      text,
      dueDate: dueDate || "",
      userId,
      priority: priority || "medium",
      category: category || "general",
      completed: completed || false,
    });

    const savedTodo = await todo.save();
    console.log("✅ Todo created:", savedTodo._id);

    res.status(201).json({
      success: true,
      data: savedTodo,
    });
  } catch (error) {
    console.error("❌ Create todo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating todo",
    });
  }
};

// Update a todo
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed, dueDate, priority, category } = req.body;
    console.log("🔄 Updating todo:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid todo ID",
      });
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    // Ensure the user can only update their own todos
    if (
      todo.userId.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this todo",
      });
    }

    // Update fields
    todo.text = text || todo.text;
    todo.completed = completed !== undefined ? completed : todo.completed;
    todo.dueDate = dueDate !== undefined ? dueDate : todo.dueDate;
    todo.priority = priority || todo.priority;
    todo.category = category || todo.category;

    const updatedTodo = await todo.save();
    console.log("✅ Todo updated:", id);

    res.json({
      success: true,
      data: updatedTodo,
    });
  } catch (error) {
    console.error("❌ Update todo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating todo",
    });
  }
};

// Delete a todo
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Deleting todo:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid todo ID",
      });
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    // Ensure the user can only delete their own todos
    if (
      todo.userId.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this todo",
      });
    }

    await Todo.findByIdAndDelete(id);
    console.log("✅ Todo deleted successfully");

    res.json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete todo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting todo",
    });
  }
};
