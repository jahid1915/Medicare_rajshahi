const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");

const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Security Middleware (Relax CSP for frontend assets & scripts)
app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev to avoid blocking
  },
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting on API
app.use("/api/", generalLimiter);

// Health Check
app.get(["/health", "/api/health"], (req, res) => {
  res.json({
    success: true,
    message: "Medicare API is running healthy",
    environment: process.env.NODE_ENV || "production",
    status: "UP",
    timestamp: new Date().toISOString()
  });
});

// API Overview
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Medicare Rajshahi API v1.0",
    version: "1.0.0",
    status: "Active",
    availableRoutes: [
      "/api/auth",
      "/api/doctors",
      "/api/hospitals",
      "/api/pharmacies",
      "/api/medicines",
      "/api/appointments",
      "/api/pharmacy-orders",
      "/api/prescriptions",
      "/api/payments"
    ]
  });
});

// API Routes
app.use("/api/auth",            require("./routes/auth"));
app.use("/api/hospitals",       require("./routes/hospitals"));
app.use("/api/doctors",         require("./routes/doctors"));
app.use("/api/appointments",    require("./routes/appointments"));
app.use("/api/payments",        require("./routes/payments"));
app.use("/api/pharmacies",      require("./routes/pharmacies"));
app.use("/api/medicines",       require("./routes/medicines"));
app.use("/api/pharmacy-orders", require("./routes/pharmacyOrders"));
app.use("/api/prescriptions",   require("./routes/prescriptions"));

// Serve Frontend Static Build if present (Single Fullstack Deployment)
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  console.log(`[Static] Serving frontend from ${frontendDist}`);
  app.use(express.static(frontendDist));
  
  // For any non-API GET route, serve index.html for SPA client-side routing
  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/health")) {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  // If frontend dist is not built, provide root JSON info
  app.get("/", (req, res) => {
    res.json({
      success: true,
      service: "Niramoy / Medicare Rajshahi Healthcare API",
      status: "Operational",
      version: "1.0.0",
      message: "Welcome to Medicare Rajshahi Backend API. Build the frontend to serve the UI here.",
      health: "/health",
      api: "/api"
    });
  });
}

// 404 handler for unknown API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: `API Route ${req.originalUrl} not found`, code: "NOT_FOUND" });
});

// Fallback 404 handler
app.use("*", (req, res) => {
  if (fs.existsSync(frontendDist)) {
    return res.sendFile(path.join(frontendDist, "index.html"));
  }
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found`, code: "NOT_FOUND" });
});

// Centralized Error Handler — MUST be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   Medicare Rajshahi Backend API       ║
  ║   Port: ${PORT}                          ║
  ║   Environment: ${(process.env.NODE_ENV || "development").padEnd(12)}    ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = server;
