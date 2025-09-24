import dotenv from "dotenv";
import mongoose from "mongoose";
import process from "process";

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    console.log("🔄 Testing MongoDB connection...");
    console.log(
      "📝 Connection String:",
      process.env.MONGODB_URI?.replace(/:[^:@]*@/, ":****@")
    );

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connection successful!");
    console.log("🏠 Host:", conn.connection.host);
    console.log("📊 Database:", conn.connection.name);
    console.log("🔌 Ready State:", conn.connection.readyState);

    // Test a simple operation
    const testCollection = conn.connection.db.collection("test");
    await testCollection.insertOne({
      test: "connection",
      timestamp: new Date(),
    });
    console.log("✅ Test document inserted successfully");

    await mongoose.connection.close();
    console.log("🔒 Connection closed");
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.message.includes("bad auth")) {
      console.log("\n🔧 Authentication troubleshooting:");
      console.log("1. Check if username and password are correct");
      console.log("2. Verify user exists in MongoDB Atlas");
      console.log("3. Ensure user has proper database permissions");
      console.log("4. Check if IP address is whitelisted");
    }
  }
};

testConnection();
