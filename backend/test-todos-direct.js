import mongoose from "mongoose";
import dotenv from "dotenv";
import process from "process";

// Load environment variables
dotenv.config();

console.log("🚀 Testing todos database operations...");

async function testTodosDatabase() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create user schema
    const userSchema = new mongoose.Schema(
      {
        name: String,
        email: { type: String, unique: true },
        password: String,
      },
      { timestamps: true }
    );

    // Create todo schema
    const todoSchema = new mongoose.Schema(
      {
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TestUser",
          required: true,
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        dueDate: Date,
        category: { type: String, default: "general" },
      },
      { timestamps: true }
    );

    const User = mongoose.model("TestUser", userSchema);
    const Todo = mongoose.model("TestTodo", todoSchema);

    // Get or create a test user
    let testUser = await User.findOne({ email: "testuser@example.com" });

    if (!testUser) {
      console.log("📝 Creating test user...");
      testUser = await User.create({
        name: "Todo Test User",
        email: "testuser@example.com",
        password: "password123",
      });
      console.log(`✅ Test user created: ${testUser._id}`);
    } else {
      console.log(`✅ Test user found: ${testUser._id}`);
    }

    // Create test todos
    console.log("\n📝 Creating test todos...");

    const testTodos = [
      {
        text: "Complete project documentation",
        completed: false,
        user: testUser._id,
        priority: "high",
        category: "work",
      },
      {
        text: "Buy groceries",
        completed: false,
        user: testUser._id,
        priority: "medium",
        category: "personal",
      },
      {
        text: "Exercise for 30 minutes",
        completed: true,
        user: testUser._id,
        priority: "low",
        category: "health",
      },
    ];

    // Clear existing test todos
    await Todo.deleteMany({ user: testUser._id });

    // Create new todos
    const createdTodos = await Todo.create(testTodos);
    console.log(`✅ Created ${createdTodos.length} todos`);

    // Display created todos
    createdTodos.forEach((todo, index) => {
      console.log(
        `   ${index + 1}. "${todo.text}" - ${todo.completed ? "✅" : "⏳"} - ${
          todo.priority
        } - ${todo.category}`
      );
    });

    // Test todo queries
    console.log("\n🔍 Testing todo queries...");

    // Get all todos for user
    const allTodos = await Todo.find({ user: testUser._id }).populate(
      "user",
      "name email"
    );
    console.log(`📊 Total todos for user: ${allTodos.length}`);

    // Get incomplete todos
    const incompleteTodos = await Todo.find({
      user: testUser._id,
      completed: false,
    });
    console.log(`📋 Incomplete todos: ${incompleteTodos.length}`);

    // Get high priority todos
    const highPriorityTodos = await Todo.find({
      user: testUser._id,
      priority: "high",
    });
    console.log(`🔥 High priority todos: ${highPriorityTodos.length}`);

    // Update a todo
    console.log("\n✏️ Testing todo update...");
    const todoToUpdate = await Todo.findOne({
      user: testUser._id,
      completed: false,
    });
    if (todoToUpdate) {
      todoToUpdate.completed = true;
      await todoToUpdate.save();
      console.log(
        `✅ Updated todo: "${todoToUpdate.text}" marked as completed`
      );
    }

    // Get final stats
    const finalStats = await Todo.aggregate([
      { $match: { user: testUser._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$completed", 1, 0] } },
          pending: { $sum: { $cond: ["$completed", 0, 1] } },
        },
      },
    ]);

    if (finalStats.length > 0) {
      const stats = finalStats[0];
      console.log(`\n📊 Final Todo Statistics:`);
      console.log(`   Total: ${stats.total}`);
      console.log(`   Completed: ${stats.completed}`);
      console.log(`   Pending: ${stats.pending}`);
    }

    console.log("\n🎉 Todo database test completed successfully!");

    // List all users and their todo counts
    const usersWithTodos = await User.aggregate([
      {
        $lookup: {
          from: "testtodos",
          localField: "_id",
          foreignField: "user",
          as: "todos",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          todoCount: { $size: "$todos" },
        },
      },
    ]);

    console.log(`\n👥 Users and their todo counts:`);
    usersWithTodos.forEach((user) => {
      console.log(`   ${user.name} (${user.email}): ${user.todoCount} todos`);
    });
  } catch (error) {
    console.error("❌ Todo database test failed:");
    console.error(error.message);
    console.error(error.stack);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("🛑 Database connection closed");
    process.exit(0);
  }
}

testTodosDatabase();
