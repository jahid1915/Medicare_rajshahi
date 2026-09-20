/**
 * Centralized error handler middleware
 * Must be registered LAST in Express app
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = "Validation failed";
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(statusCode).json({ success: false, message, code: "VALIDATION_ERROR", errors });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    return res.status(statusCode).json({ success: false, message, code: "DUPLICATE_KEY" });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token", code: "INVALID_TOKEN" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired", code: "TOKEN_EXPIRED" });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
    return res.status(statusCode).json({ success: false, message, code: "INVALID_ID" });
  }

  // Do not expose internal stack traces in production
  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : message,
    code: err.code || "SERVER_ERROR"
  });
};

module.exports = errorHandler;
