import { useState, useEffect } from "react";
import AppName from "./components/AppName";
import AddTodo from "./components/AddTodo";
import TodoItems from "./components/TodoItems";
import WelcomeMessage from "./components/WelcomeMessage";
import { authAPI, todoAPI } from "./services/api";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false); // toggle login/signup
  const [todoItems, setTodoItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [otpStep, setOtpStep] = useState(false); // true when user needs to verify OTP
  const [otpSent, setOtpSent] = useState(false);

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
      // Clear form
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const result = await authAPI.sendOTP({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setOtpStep(true);
      setOtpSent(true);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!formData.otp) {
      alert("Please enter the OTP!");
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
        setIsSignup(false); // switch back to login
        setOtpStep(false);
        setOtpSent(false);
        // Clear form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          otp: "",
        });
      }
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
      alert("❌ Please enter a task name.");
      return;
    }

    if (!currentUser) {
      alert("❌ Please log in to add tasks.");
      return;
    }

    console.log("Creating todo for user:", currentUser);
    console.log("User ID:", currentUser.id);

    const result = await todoAPI.createTodo({
      text: itemName,
      userId: currentUser.id,
      dueDate: itemDueDate || undefined,
    });

    if (result.success) {
      await loadTodos(currentUser.id); // Refresh todo list
    }
  };

  const handleDeleteItem = async (todoId) => {
    const result = await todoAPI.deleteTodo(todoId);
    if (result.success && currentUser) {
      await loadTodos(currentUser.id); // Refresh todo list
    }
  };

  // 🎨 Styles
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      background: "#fff",
      padding: "40px",
      borderRadius: "12px",
      boxShadow: "0px 6px 18px rgba(0,0,0,0.25)",
      width: "350px",
      textAlign: "center",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "20px",
    },
    input: {
      width: "100%",
      padding: "12px",
      margin: "10px 0",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "14px",
    },
    button: {
      width: "100%",
      padding: "12px",
      marginTop: "15px",
      borderRadius: "6px",
      border: "none",
      background: "#667eea",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "0.3s ease",
    },
    linkText: {
      marginTop: "15px",
      fontSize: "14px",
      color: "#555",
    },
    link: {
      color: "#667eea",
      cursor: "pointer",
      fontWeight: "bold",
      marginLeft: "5px",
    },
  };

  // 🔹 If not logged in → show login/signup card
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>
            {isSignup ? (otpStep ? "Verify Email" : "Sign Up") : "Login"}
          </h2>
          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            {isSignup && !otpStep && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleFormChange}
                style={styles.input}
                required
              />
            )}
            {!otpStep && (
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleFormChange}
                style={styles.input}
                required
              />
            )}
            {!otpStep && (
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleFormChange}
                style={styles.input}
                required
              />
            )}
            {isSignup && !otpStep && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleFormChange}
                style={styles.input}
                required
              />
            )}
            {otpStep && (
              <>
                <p
                  style={{
                    marginBottom: "15px",
                    color: "#555",
                    fontSize: "14px",
                  }}
                >
                  We&apos;ve sent a verification code to{" "}
                  <strong>{formData.email}</strong>
                </p>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleFormChange}
                  style={styles.input}
                  maxLength="6"
                  required
                />
              </>
            )}
            <button type="submit" style={styles.button}>
              {isSignup
                ? otpStep
                  ? "Verify & Complete Signup"
                  : "Send OTP"
                : "Login"}
            </button>
          </form>
          <p style={styles.linkText}>
            {isSignup ? "Already have an account?" : "Don’t have an account?"}
            <span
              style={styles.link}
              onClick={() => setIsSignup((prev) => !prev)}
            >
              {isSignup ? "Login" : "Sign Up"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // 🔹 After login → show todo app
  return (
    <div className="todo-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <div>
          <strong>Welcome, {currentUser?.name}!</strong>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
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
