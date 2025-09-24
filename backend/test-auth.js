import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api";

// Test user registration
async function testRegister() {
  try {
    console.log("🧪 Testing user registration...");

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    });

    const data = await response.json();
    console.log("Registration Response:", data);

    if (data.success) {
      console.log("✅ Registration successful");
      return data.token;
    } else {
      console.log("❌ Registration failed:", data.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    return null;
  }
}

// Test user login
async function testLogin() {
  try {
    console.log("\n🧪 Testing user login...");

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const data = await response.json();
    console.log("Login Response:", data);

    if (data.success) {
      console.log("✅ Login successful");
      return data.token;
    } else {
      console.log("❌ Login failed:", data.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return null;
  }
}

// Test protected todo route
async function testTodos(token) {
  try {
    console.log("\n🧪 Testing protected todos endpoint...");

    const response = await fetch(`${API_BASE}/todos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Todos Response:", data);

    if (data.success) {
      console.log("✅ Protected route access successful");
    } else {
      console.log("❌ Protected route access failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Todos error:", error.message);
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting authentication tests...\n");

  // Test registration
  let token = await testRegister();

  // If registration fails, try login
  if (!token) {
    token = await testLogin();
  }

  // Test protected route if we have a token
  if (token) {
    await testTodos(token);
  }

  console.log("\n🏁 Tests completed!");
}

runTests();
