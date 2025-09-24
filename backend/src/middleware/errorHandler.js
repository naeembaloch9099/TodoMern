import process from "process";

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Error Stack:", err.stack);

  // Default error
  let error = {
    success: false,
    message: err.message || "Server Error",
    status: err.status || err.statusCode || 500,
  };

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.message = "Resource not found";
    error.status = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate ${field} entered`;
    error.status = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error.message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error.status = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    error.status = 401;
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token expired";
    error.status = 401;
  }

  const response = {
    success: false,
    message: error.message,
  };

  // Include error details in development
  if (process?.env?.NODE_ENV === "development") {
    response.error = err;
    response.stack = err.stack;
  }

  res.status(error.status).json(response);
};
