import React, { useState } from "react";

const LoginSignup = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    alert(`Login with: ${loginData.email}`);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert(`Signup with: ${signupData.email}`);
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
      fontFamily: "Arial, sans-serif",
    },
    wrapper: {
      display: "flex",
      gap: "30px",
    },
    card: {
      background: "#fff",
      padding: "25px",
      borderRadius: "10px",
      boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
      width: "300px",
    },
    title: {
      marginBottom: "15px",
      fontSize: "20px",
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
    },
    input: {
      width: "100%",
      padding: "10px",
      margin: "8px 0",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "14px",
    },
    button: {
      width: "100%",
      padding: "10px",
      marginTop: "12px",
      borderRadius: "5px",
      border: "none",
      background: "#667eea",
      color: "white",
      fontSize: "15px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Login Form */}
        <div style={styles.card}>
          <h2 style={styles.title}>Login</h2>
          <form onSubmit={handleLoginSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              style={styles.input}
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              style={styles.input}
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
            <button type="submit" style={styles.button}>
              Login
            </button>
          </form>
        </div>

        {/* Signup Form */}
        <div style={styles.card}>
          <h2 style={styles.title}>Sign Up</h2>
          <form onSubmit={handleSignupSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              style={styles.input}
              value={signupData.name}
              onChange={handleSignupChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              style={styles.input}
              value={signupData.email}
              onChange={handleSignupChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              style={styles.input}
              value={signupData.password}
              onChange={handleSignupChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              style={styles.input}
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              required
            />
            <button type="submit" style={styles.button}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
