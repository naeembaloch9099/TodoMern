import React, { useState, useEffect, useRef } from "react";
import "./Toast.css";

const Toast = ({ message, type, isVisible, onClose, duration = 4000 }) => {
  const [isShowing, setIsShowing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);

      // Auto close toast after duration
      timerRef.current = setTimeout(() => {
        setIsShowing(false);

        // Add a small delay before calling onClose to allow animation to complete
        setTimeout(() => {
          onClose();
        }, 300);
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVisible, duration, onClose]);

  // If not visible, don't render
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📣";
    }
  };

  const getTypeClass = () => {
    return `toast ${type || "default"} ${
      isShowing ? "toast-show" : "toast-hide"
    }`;
  };

  return (
    <div className={getTypeClass()} onClick={onClose}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <p className="toast-message">{message}</p>
        <button
          className="toast-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>
      </div>
      <div className="toast-progress">
        <div
          className="toast-progress-bar"
          style={{ animationDuration: `${duration}ms` }}
        ></div>
      </div>
    </div>
  );
};

export const ToastManager = () => {
  const [toasts, setToasts] = useState([]);

  // Generate a unique ID for each toast
  const generateId = () => {
    return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  useEffect(() => {
    // Create the toast methods on the window object
    window.showSuccess = (message, duration) => {
      const id = generateId();
      setToasts((prev) => [
        ...prev,
        { id, message, type: "success", duration },
      ]);
      return id;
    };

    window.showError = (message, duration) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, message, type: "error", duration }]);
      return id;
    };

    window.showWarning = (message, duration) => {
      const id = generateId();
      setToasts((prev) => [
        ...prev,
        { id, message, type: "warning", duration },
      ]);
      return id;
    };

    window.showInfo = (message, duration) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, message, type: "info", duration }]);
      return id;
    };

    window.closeToast = (id) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // Clean up the methods when component unmounts
    return () => {
      delete window.showSuccess;
      delete window.showError;
      delete window.showWarning;
      delete window.showInfo;
      delete window.closeToast;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration || 4000}
        />
      ))}
    </div>
  );
};

export default Toast;
