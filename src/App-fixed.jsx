import { useState, useEffect } from "react";
import AppName from "./components/AppName";
import AddTodo from "./components/AddTodo";
import TodoItems from "./components/TodoItems";
import WelcomeMessage from "./components/WelcomeMessage";
import { authAPI, todoAPI } from "./services/api";
import "./App.css";

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
    otp: "",
  });
  const [otpStep, setOtpStep] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check for existing user on component mount
  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user) {
      console.log("User from localStorage:", user);
      setCurrentUser(user);
      setIsLoggedIn(true);
      loadTodos(user.id);
    }
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Load todos for current user
  const loadTodos = async (userId) => {
    console.log("Loading todos for userId:", userId);
    const result = await todoAPI.getTodos(userId);
    if (result.success) {
      console.log("Todos loaded:", result.data);
      setTodoItems(result.data);
    } else {
      console.log("Failed to load todos");
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
    const result = await authAPI.login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      console.log("Login successful, user data:", result.data);
      setCurrentUser(result.data);
      setIsLoggedIn(true);
      await loadTodos(result.data.id);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: "",
      });
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill all fields!");
      return;
    }

    const result = await authAPI.sendOTP({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setOtpStep(true);
      setResendCooldown(60); // 60 second cooldown
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!formData.otp || formData.otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP!");
      return;
    }

    const result = await authAPI.verifyOTP({
      email: formData.email,
      otp: formData.otp,
    });

    if (result.success) {
      // Now register the user
      const registerResult = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (registerResult.success) {
        alert("🎉 Account created successfully! Please login to continue.");
        setIsSignup(false);
        setOtpStep(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          otp: "",
        });
      }
    } else {
      alert("Invalid OTP! Please try again or request a new one.");
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      alert(
        `⏳ Please wait ${resendCooldown} seconds before requesting a new OTP.`
      );
      return;
    }

    const result = await authAPI.sendOTP({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setResendCooldown(60);
    } else {
      alert("Failed to resend OTP. Please try again.");
    }
  };

  const handleSignup = async (e) => {
    if (!otpStep) {
      await handleSendOTP(e);
    } else {
      await handleVerifyOTP(e);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setTodoItems([]);
  };

  const handleNewItem = async (itemName, itemDueDate) => {
    if (!itemName.trim()) {
      alert("Please enter a task name.");
      return;
    }

    if (!currentUser?.id) {
      console.error("User ID is undefined:", currentUser);
      alert("Authentication error. Please login again.");
      return;
    }

    console.log("Adding todo for userId:", currentUser.id);
    const result = await todoAPI.createTodo({
      name: itemName,
      dueDate: itemDueDate,
      userId: currentUser.id,
    });

    if (result.success) {
      console.log("Todo created:", result.data);
      await loadTodos(currentUser.id);
    } else {
      console.error("Failed to create todo:", result.message);
    }
  };

  const handleDeleteItem = async (todoName) => {
    if (!currentUser?.id) {
      alert(" Authentication error. Please login again.");
      return;
    }

    const result = await todoAPI.deleteTodo(todoName, currentUser.id);
    if (result.success) {
      await loadTodos(currentUser.id);
    }
  };

  // Styles
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
    },
    card: {
      background: "white",
      padding: "40px",
      borderRadius: "15px",
      boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
      width: "100%",
      maxWidth: "450px",
      textAlign: "center",
    },
    title: {
      marginBottom: "30px",
      color: "#333",
      fontSize: "28px",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      padding: "15px",
      marginBottom: "20px",
      border: "2px solid #e1e1e1",
      borderRadius: "8px",
      fontSize: "16px",
      boxSizing: "border-box",
      transition: "border-color 0.3s ease",
    },
    button: {
      width: "100%",
      padding: "15px",
      marginTop: "15px",
      borderRadius: "8px",
      border: "none",
      background: "#667eea",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "0.3s ease",
    },
    secondaryButton: {
      width: "100%",
      padding: "12px",
      marginTop: "10px",
      borderRadius: "8px",
      border: "2px solid #667eea",
      background: "transparent",
      color: "#667eea",
      fontSize: "14px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "0.3s ease",
    },
    linkText: {
      marginTop: "20px",
      fontSize: "14px",
      color: "#555",
    },
    link: {
      color: "#667eea",
      cursor: "pointer",
      fontWeight: "bold",
      marginLeft: "5px",
      textDecoration: "underline",
    },
    otpInfo: {
      marginBottom: "20px",
      padding: "15px",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      fontSize: "14px",
      color: "#555",
    },
  };

  // Authentication Forms
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>
            {isSignup
              ? otpStep
                ? "📧 Verify Email"
                : "✨ Create Account"
              : "🔐 Welcome Back"}
          </h2>

          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            {/* Signup Form - Initial Step */}
            {isSignup && !otpStep && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleFormChange}
                  style={styles.input}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleFormChange}
                  style={styles.input}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleFormChange}
                  style={styles.input}
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  style={styles.input}
                  required
                />
              </>
            )}

            {/* Login Form */}
            {!isSignup && !otpStep && (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleFormChange}
                  style={styles.input}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleFormChange}
                  style={styles.input}
                  required
                />
              </>
            )}

            {/* OTP Verification Step */}
            {otpStep && (
              <>
                <div style={styles.otpInfo}>
                  <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
                    📧 Check Your Email
                  </p>
                  <p style={{ margin: "0", fontSize: "13px" }}>
                    We&apos;ve sent a 6-digit verification code to:
                    <br />
                    <strong>{formData.email}</strong>
                  </p>
                </div>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleFormChange}
                  style={styles.input}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                />
              </>
            )}

            <button type="submit" style={styles.button}>
              {isSignup
                ? otpStep
                  ? "🔐 Verify & Create Account"
                  : "📧 Send Verification Code"
                : "🚀 Login"}
            </button>
          </form>

          {/* OTP Step Navigation */}
          {otpStep && (
            <div>
              <button
                type="button"
                onClick={handleResendOTP}
                style={{
                  ...styles.secondaryButton,
                  opacity: resendCooldown > 0 ? 0.5 : 1,
                  cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                }}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `⏳ Resend OTP (${resendCooldown}s)`
                  : "📧 Resend OTP"}
              </button>
              <p style={styles.linkText}>
                <span
                  style={styles.link}
                  onClick={() => {
                    setOtpStep(false);
                    setResendCooldown(0);
                    setFormData((prev) => ({ ...prev, otp: "" }));
                  }}
                >
                  ← Back to Signup
                </span>
              </p>
            </div>
          )}

          {/* Login/Signup Toggle */}
          {!otpStep && (
            <p style={styles.linkText}>
              {isSignup ? "Already have an account?" : "Don't have an account?"}
              <span
                style={styles.link}
                onClick={() => {
                  setIsSignup((prev) => !prev);
                  setOtpStep(false);
                  setResendCooldown(0);
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    otp: "",
                  });
                }}
              >
                {isSignup ? "Login Here" : "Sign Up Here"}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Main Todo App (After Login)
  return (
    <div className="todo-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          background: "white",
          borderRadius: "8px",
          margin: "10px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <span style={{ fontWeight: "bold", color: "#667eea" }}>
            Welcome, {currentUser?.name}!
          </span>
          <span style={{ marginLeft: "10px", fontSize: "14px", color: "#666" }}>
            ({currentUser?.email})
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </div>

      <AppName />
      <AddTodo onNewItem={handleNewItem} />
      {todoItems.length === 0 ? (
        <WelcomeMessage />
      ) : (
        <TodoItems todoItems={todoItems} onDeleteClick={handleDeleteItem} />
      )}
    </div>
  );
}

export default App;
