import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ToastManager } from "./Toast.jsx"; // Import ToastManager

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <>
      <ToastManager /> {/* Add ToastManager outside App */}
      <App />
    </>
  </React.StrictMode>
);
