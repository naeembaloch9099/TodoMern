const API_BASE_URL = "http://localhost:5000/api";

const api = {
  // Auth APIs
  register: async (userData) => {
    try {
      console.log("📤 Sending registration data:", userData);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("📥 Registration API response:", data);

      return data;
    } catch (error) {
      console.error("❌ Registration error:", error);
      return { success: false, message: "Network error" };
    }
  },

  verifyOTP: async (verificationData) => {
    try {
      console.log("📤 Sending OTP verification data:", verificationData);

      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationData),
      });

      const data = await response.json();
      console.log("📥 OTP verification API response:", data);

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.data));
      }

      return data;
    } catch (error) {
      console.error("❌ OTP verification error:", error);
      return { success: false, message: "Network error" };
    }
  },

  resendOTP: async (email) => {
    try {
      console.log("📤 Requesting OTP resend for:", email);

      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("📥 OTP resend API response:", data);

      return data;
    } catch (error) {
      console.error("❌ OTP resend error:", error);
      return { success: false, message: "Network error" };
    }
  },

  login: async (userData) => {
    try {
      console.log("📤 Sending login data:", { email: userData.email });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("📥 Login API response:", data);

      if (data.success) {
        console.log(
          "✅ Setting auth token:",
          data.token?.substring(0, 15) + "..."
        );
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.data));
      }

      return data;
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, message: "Network error" };
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    console.log("✅ User logged out");

    return { success: true, message: "Logged out successfully" };
  },

  // Todo APIs
  getTodos: async (userId) => {
    try {
      const token = localStorage.getItem("authToken");

      console.log(
        "🔍 Getting todos with token:",
        token?.substring(0, 15) + "..."
      );
      console.log("🔍 For userId:", userId);

      if (!token || !userId) {
        console.warn("❌ Missing token or userId for getTodos");
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${API_BASE_URL}/todos?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔍 getTodos response status:", response.status);

      const data = await response.json();
      console.log("📥 Get todos API response:", data);

      return data;
    } catch (error) {
      console.error("❌ Get todos error:", error);
      return { success: false, message: "Network error" };
    }
  },

  createTodo: async (todoData) => {
    try {
      const token = localStorage.getItem("authToken");

      console.log("📤 Creating todo with data:", todoData);

      if (!token) {
        console.warn("❌ Missing token for createTodo");
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(todoData),
      });

      const data = await response.json();
      console.log("📥 Create todo API response:", data);

      return data;
    } catch (error) {
      console.error("❌ Create todo error:", error);
      return { success: false, message: "Network error" };
    }
  },

  updateTodo: async (id, todoData) => {
    try {
      const token = localStorage.getItem("authToken");

      console.log("📤 Updating todo:", id, todoData);

      if (!token) {
        console.warn("❌ Missing token for updateTodo");
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(todoData),
      });

      const data = await response.json();
      console.log("📥 Update todo API response:", data);

      return data;
    } catch (error) {
      console.error("❌ Update todo error:", error);
      return { success: false, message: "Network error" };
    }
  },

  deleteTodo: async (id) => {
    try {
      const token = localStorage.getItem("authToken");

      console.log("📤 Deleting todo:", id);

      if (!token) {
        console.warn("❌ Missing token for deleteTodo");
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("📥 Delete todo API response:", data);

      return data;
    } catch (error) {
      console.error("❌ Delete todo error:", error);
      return { success: false, message: "Network error" };
    }
  },
};

export default api;
