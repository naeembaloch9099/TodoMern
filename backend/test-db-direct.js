import mongoose from "mongoose";
import dotenv from "dotenv";
import process from "process";

// Load environment variables
dotenv.config();

console.log("🚀 Testing direct database operations...");

async function testDatabase() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create simple user schema
    const userSchema = new mongoose.Schema(
      {
        name: String,
        email: { type: String, unique: true },
        password: String,
      },
      { timestamps: true }
    );

    const User = mongoose.model("TestUser", userSchema);

    // Test user creation
    console.log("\n📝 Testing user creation...");

    const testUser = {
      name: "Direct Test User",
      email: "directtest@example.com",
      password: "testpassword123",
    };

    // Delete existing user if any
    await User.deleteOne({ email: testUser.email });

    // Create new user
    const user = await User.create(testUser);
    console.log("✅ User created successfully:");
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${user.createdAt}`);

    // Verify user exists
    const foundUser = await User.findById(user._id);
    if (foundUser) {
      console.log("✅ User verification successful - found in database");
    } else {
      console.log("❌ User verification failed - not found in database");
    }

    // List all users in collection
    const allUsers = await User.find({}).select("name email createdAt");
    console.log(`\n📊 Total users in database: ${allUsers.length}`);

    allUsers.forEach((user, index) => {
      console.log(
        `   ${index + 1}. ${user.name} (${user.email}) - ${user.createdAt}`
      );
    });

    console.log("\n🎉 Database test completed successfully!");
  } catch (error) {
    console.error("❌ Database test failed:");
    console.error(error.message);
    console.error(error.stack);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("🛑 Database connection closed");
    process.exit(0);
  }
}

testDatabase();
