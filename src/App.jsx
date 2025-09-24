import { useState, useEffect } from "react";
import "./App.css";
import AppName from "./components/AppName";
import AddTodo from "./components/AddTodo";
import TodoItems from "./components/TodoItems";
import WelcomeMessage from "./components/WelcomeMessage";
import OTPVerification from "./components/OTPVerification";
import api from "./services/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [todoItems, setTodoItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing user on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("currentUser");
    let user = null;

    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    console.log("🔍 Checking existing session:", {
      token: token ? "exists" : "none",
      user,
    });

    if (token && user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      loadTodos(user.id);
      window.showSuccess?.(`👋 Welcome back, ${user.name}!`);
    }
  }, []);

  // Load todos for current user
  const loadTodos = async (userId) => {
    console.log("📋 Loading todos for userId:", userId);
    if (!userId) {
      console.log("No userId provided");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getTodos(userId);
      console.log("📥 Todos response:", response);

      if (response.success) {
        console.log("Todos loaded:", response.data);
        setTodoItems(response.data || []);
      } else {
        console.log("Failed to load todos:", response.message);
        window.showError?.(response.message || "Failed to load tasks");
      }
    } catch (error) {
      console.log("Error loading todos:", error);
      window.showError?.("Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      window.showError?.("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const loginData = {
        email: formData.email,
        password: formData.password,
      };

      console.log("🔐 Attempting login:", { email: loginData.email });

      const response = await api.login(loginData);
      console.log("📊 Login response:", response);

      if (response.success) {
        const userData = response.data;
        console.log("✅ Login successful, user data:", userData);

        setCurrentUser(userData);
        setIsLoggedIn(true);
        loadTodos(userData.id);

        // Clear form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        window.showSuccess?.(`🎉 Welcome back, ${userData.name}!`);
      } else {
        console.log("❌ Login failed:", response.message);
        window.showError?.(response.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      window.showError?.("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      window.showError?.("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      window.showError?.("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      window.showError?.("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        setOtpEmail(formData.email);
        setOtpStep(true);
        window.showSuccess?.("📧 Verification code sent to your email!");
      } else {
        // Specifically check for already existing account
        if (response.message && response.message.includes("already exists")) {
          window.showError?.(
            "🚫 This email is already registered. Please login instead."
          );
        } else {
          window.showError?.(
            response.message || "Failed to send verification code"
          );
        }
      }
    } catch (error) {
      console.error("❌ Send OTP error:", error);
      window.showError?.("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    setIsLoading(true);

    try {
      // Verify the OTP and complete registration in one step
      const verifyResponse = await api.verifyOTP({
        email: otpEmail,
        otp: otpCode,
      });

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.message || "Invalid verification code");
      }

      // If successful, OTP verification already completes registration
      // and returns user data and token
      const userData = verifyResponse.data;

      if (userData && verifyResponse.token) {
        // Auto login after successful verification
        localStorage.setItem("authToken", verifyResponse.token);
        localStorage.setItem("currentUser", JSON.stringify(userData));

        setCurrentUser(userData);
        setIsLoggedIn(true);
        setOtpStep(false);

        window.showSuccess?.(`Welcome to Todo App, ${userData.name}!`);
        loadTodos(userData.id);
      } else {
        // If no auto-login, just return to login page
        window.showSuccess?.("Account created successfully! Please login.");
        setOtpStep(false);
        setIsSignup(false);
        setFormData({
          name: "",
          email: formData.email, // Keep email for easy login
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      window.showError?.(error.message || "Verification failed");
      throw error; // Re-throw to let OTPVerification handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      window.showInfo?.("Sending new verification code...");
      const response = await api.resendOTP(otpEmail);

      if (!response.success) {
        throw new Error(
          response.message || "Failed to resend verification code"
        );
      }

      window.showSuccess?.("📧 New verification code sent to your email!");
      return response;
    } catch (error) {
      console.error("Resend OTP error:", error);
      window.showError?.(error.message || "Failed to resend verification code");
      throw error;
    }
  };

  const handleBackToSignup = () => {
    setOtpStep(false);
    setOtpEmail("");
    window.showInfo?.("🔙 Returned to signup form");
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
      setIsLoggedIn(false);
      setTodoItems([]);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      window.showInfo?.("👋 Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNewItem = async (itemName, itemDueDate) => {
    console.log("➕ Creating todo for user:", currentUser?.id);

    if (!currentUser?.id) {
      window.showError?.("User not authenticated");
      return;
    }

    if (!itemName.trim()) {
      window.showError?.("Task cannot be empty!");
      return;
    }

    try {
      // Make sure all required fields are included
      const todoData = {
        text: itemName,
        dueDate: itemDueDate || "",
        userId: currentUser.id,
        priority: "medium",
        category: "general",
        completed: false,
      };

      console.log("📤 Sending todo data:", todoData);

      const response = await api.createTodo(todoData);
      console.log("📥 Create todo response:", response);

      if (response.success) {
        console.log("✅ Todo created:", response.data);
        setTodoItems((prev) => [...prev, response.data]);
        window.showSuccess?.("✅ Task added successfully!");
      } else {
        console.log("❌ Failed to create todo:", response.message);
        window.showError?.(response.message || "Failed to add task");
      }
    } catch (error) {
      console.error("❌ Error creating todo:", error);
      window.showError?.("Failed to add task. Please try again.");
    }
  };

  const handleDeleteItem = async (todoId) => {
    try {
      console.log("🗑️ Deleting todo:", todoId);

      window.showInfo?.("🗑️ Deleting task...");
      const response = await api.deleteTodo(todoId);
      console.log("📥 Delete todo response:", response);

      if (response.success) {
        setTodoItems((prev) => prev.filter((item) => item._id !== todoId));
        window.showSuccess?.("🗑️ Task deleted successfully!");
      } else {
        window.showError?.(response.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("❌ Error deleting todo:", error);
      window.showError?.("Failed to delete task. Please try again.");
    }
  };

  // If user is logged in, show the todo app
  return (
    <>
      {isLoggedIn && currentUser ? (
        <center className="todo-container">
          <AppName />
          <div className="user-info">
            <span>Welcome, {currentUser.name}! </span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
          <AddTodo onNewItem={handleNewItem} />
          {isLoading ? (
            <div className="loading-spinner">Loading tasks...</div>
          ) : todoItems.length === 0 ? (
            <WelcomeMessage />
          ) : (
            <TodoItems todoItems={todoItems} onDeleteClick={handleDeleteItem} />
          )}
        </center>
      ) : otpStep ? (
        <center className="auth-container">
          <AppName />
          <OTPVerification
            email={otpEmail}
            onVerifySuccess={handleVerifyOTP}
            onBackToSignup={handleBackToSignup}
            onResendOTP={handleResendOTP}
            isLoading={isLoading}
          />
        </center>
      ) : (
        <center className="auth-container">
          <AppName />
          <div className="auth-form">
            <h2>{isSignup ? "Sign Up" : "Login"}</h2>

            <form onSubmit={isSignup ? handleSendOTP : handleLogin}>
              {isSignup && (
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleFormChange}
                required
              />

              {isSignup && (
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  required
                />
              )}

              <button type="submit" disabled={isLoading}>
                {isLoading
                  ? isSignup
                    ? "🔄 Sending Code..."
                    : "🔄 Logging in..."
                  : isSignup
                  ? "📧 Send Verification Code"
                  : "🔐 Login"}
              </button>
            </form>

            <p>
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <span
                className="auth-link"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  });
                }}
              >
                {isSignup ? "Login" : "Sign Up"}
              </span>
            </p>
          </div>
        </center>
      )}
    </>
  );
}

export default App;
