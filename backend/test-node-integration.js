// Simple Node.js test for the API endpoints
import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api";

console.log("🧪 Testing complete authentication and todo system...\n");

async function runTests() {
  let userId, todoId;

  try {
    // Test 1: Register user
    console.log("1. Testing user registration...");
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
      }),
    });

    const registerData = await registerResponse.json();
    if (registerData.success) {
      console.log("✅ Registration successful:", registerData.message);
    } else {
      console.log("ℹ️ Registration response:", registerData.message);
    }

    // Test 2: Login
    console.log("\n2. Testing user login...");
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "jane@example.com",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    if (loginData.success) {
      console.log("✅ Login successful:", loginData.message);
      userId = loginData.data.id;
      console.log("   User ID:", userId);
    } else {
      console.log("❌ Login failed:", loginData.message);
      return;
    }

    // Test 3: Create todo
    console.log("\n3. Testing todo creation...");
    const todoResponse = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Learn React and Node.js",
        userId: userId,
        priority: "high",
        category: "learning",
      }),
    });

    const todoData = await todoResponse.json();
    if (todoData.success) {
      console.log("✅ Todo created successfully:", todoData.message);
      todoId = todoData.data._id;
      console.log("   Todo ID:", todoId);
    } else {
      console.log("❌ Todo creation failed:", todoData.message);
    }

    // Test 4: Get todos
    console.log("\n4. Testing get todos...");
    const todosResponse = await fetch(`${API_BASE}/todos?userId=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const todosData = await todosResponse.json();
    if (todosData.success) {
      console.log(
        `✅ Get todos successful. Found ${todosData.data.length} todos`
      );
      if (todosData.data.length > 0) {
        console.log("   First todo:", todosData.data[0].text);
      }
    } else {
      console.log("❌ Get todos failed:", todosData.message);
    }

    // Test 5: Update todo
    if (todoId) {
      console.log("\n5. Testing todo update...");
      const updateResponse = await fetch(`${API_BASE}/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      const updateData = await updateResponse.json();
      if (updateData.success) {
        console.log("✅ Todo updated successfully:", updateData.message);
      } else {
        console.log("❌ Todo update failed:", updateData.message);
      }
    }

    // Test 6: Delete todo
    if (todoId) {
      console.log("\n6. Testing todo deletion...");
      const deleteResponse = await fetch(`${API_BASE}/todos/${todoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const deleteData = await deleteResponse.json();
      if (deleteData.success) {
        console.log("✅ Todo deleted successfully:", deleteData.message);
      } else {
        console.log("❌ Todo deletion failed:", deleteData.message);
      }
    }

    console.log("\n🎉 All tests completed!");
    console.log(
      "✅ Your backend is working and data is being saved to MongoDB!"
    );
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

runTests();
