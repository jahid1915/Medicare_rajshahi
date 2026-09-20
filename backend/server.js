const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Security Middleware
app.use(helmet());
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

// Rate Limiting
app.use("/api/", generalLimiter);

// Root Welcome & Status
app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "Niramoy / Medicare Rajshahi Healthcare API",
    status: "Operational",
    version: "1.0.0",
    message: "Welcome to Medicare Rajshahi Backend API. All microservices are active.",
    health: "/health",
    docs: "/api",
    endpoints: {
      auth: "/api/auth",
      doctors: "/api/doctors",
      hospitals: "/api/hospitals",
      pharmacies: "/api/pharmacies",
      medicines: "/api/medicines",
      appointments: "/api/appointments",
      orders: "/api/pharmacy-orders",
      prescriptions: "/api/prescriptions",
      payments: "/api/payments"
    },
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

// Routes
app.use("/api/auth",            require("./routes/auth"));
app.use("/api/hospitals",       require("./routes/hospitals"));
app.use("/api/doctors",         require("./routes/doctors"));
app.use("/api/appointments",    require("./routes/appointments"));
app.use("/api/payments",        require("./routes/payments"));
app.use("/api/pharmacies",      require("./routes/pharmacies"));
app.use("/api/medicines",       require("./routes/medicines"));
app.use("/api/pharmacy-orders", require("./routes/pharmacyOrders"));
app.use("/api/prescriptions",   require("./routes/prescriptions"));

// 404 handler for unknown routes
app.use("*", (req, res) => {
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
