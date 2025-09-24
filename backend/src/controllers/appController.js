import process from "node:process";

// @desc    Health check
// @route   GET /api/health
// @access  Public
export const healthCheck = (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "Todo API Server is running",
    timestamp: new Date().toISOString(),
    environment: process?.env?.NODE_ENV || "development",
    version: "1.0.0",
    uptime: process?.uptime ? `${Math.floor(process.uptime())}s` : "N/A",
  });
};

// @desc    API information
// @route   GET /api
// @access  Public
export const apiInfo = (req, res) => {
  res.json({
    success: true,
    message: "Todo App REST API",
    version: "1.0.0",
    documentation: {
      health: "GET /api/health - Server health status",
      todos: {
        getAll: "GET /api/todos - Get all todos with optional filters",
        getOne: "GET /api/todos/:id - Get single todo",
        create: "POST /api/todos - Create new todo",
        update: "PUT /api/todos/:id - Update todo",
        delete: "DELETE /api/todos/:id - Delete todo",
        toggle: "PATCH /api/todos/:id/toggle - Toggle completion status",
        bulk: "POST /api/todos/bulk - Bulk operations",
        stats: "GET /api/todos/stats - Get statistics",
        overdue: "GET /api/todos/overdue - Get overdue todos",
        search: "GET /api/todos/search - Search todos",
        deleteCompleted: "DELETE /api/todos - Delete all completed",
      },
    },
    features: [
      "Full CRUD operations",
      "Search and filtering",
      "Pagination support",
      "Bulk operations",
      "Statistics tracking",
      "Due date management",
      "Priority levels",
      "Tag system",
    ],
  });
};
