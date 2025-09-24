// Request logger middleware
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`${timestamp} - ${method} ${url} - ${ip}`);

  // Log response time
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${timestamp} - ${method} ${url} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

// Validate todo input middleware
export const validateTodo = (req, res, next) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Todo text is required and must be a non-empty string",
    });
  }

  if (text.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Todo text must be less than 500 characters",
    });
  }

  // Validate priority if provided
  const { priority } = req.body;
  if (priority && !["low", "medium", "high"].includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Priority must be one of: low, medium, high",
    });
  }

  // Validate due date if provided
  const { dueDate } = req.body;
  if (dueDate && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({
      success: false,
      message: "Invalid due date format",
    });
  }

  // Validate tags if provided
  const { tags } = req.body;
  if (
    tags &&
    (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string"))
  ) {
    return res.status(400).json({
      success: false,
      message: "Tags must be an array of strings",
    });
  }

  next();
};

// Rate limiting helper (basic implementation)
const requestCounts = new Map();

export const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userRequests = requestCounts.get(key);

    if (now > userRequests.resetTime) {
      userRequests.count = 1;
      userRequests.resetTime = now + windowMs;
      return next();
    }

    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
      });
    }

    userRequests.count++;
    next();
  };
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
};

// API versioning middleware
export const apiVersion = (version = "v1") => {
  return (req, res, next) => {
    req.apiVersion = version;
    res.setHeader("API-Version", version);
    next();
  };
};
