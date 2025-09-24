import React, { useState, useEffect } from "react";
import Toast from "./../Toast";

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  // Create a unique ID for each toast
  const generateId = () => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add toast methods to window object for global access
  useEffect(() => {
    const showToast = (message, type = "info", duration = 5000) => {
      const newToast = {
        id: generateId(),
        message,
        type,
        duration,
      };

      setToasts((prevToasts) => [...prevToasts, newToast]);
      return newToast.id;
    };

    // Add helper methods for different toast types
    window.showSuccess = (message, duration) =>
      showToast(message, "success", duration);
    window.showError = (message, duration) =>
      showToast(message, "error", duration);
    window.showWarning = (message, duration) =>
      showToast(message, "warning", duration);
    window.showInfo = (message, duration) =>
      showToast(message, "info", duration);
    window.closeToast = (id) => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    return () => {
      // Clean up the global methods when component unmounts
      delete window.showSuccess;
      delete window.showError;
      delete window.showWarning;
      delete window.showInfo;
      delete window.closeToast;
    };
  }, []);

  const handleRemoveToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => handleRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
