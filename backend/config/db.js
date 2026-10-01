const mongoose = require("mongoose");

let cachedPromise = null;

const connectDB = async () => {
  // If already connected or connecting, reuse the existing connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("\n❌ [MongoDB Error]: MONGO_URI is not defined in environment variables!");
    if (process.env.NODE_ENV !== "production") {
      console.error("👉 Please create 'backend/.env' and paste your MongoDB Atlas connection string.\n");
    }
    throw new Error("MONGO_URI is not configured");
  }

  if (uri.includes("<username>") || uri.includes("<password>")) {
    console.error("\n⚠️ [MongoDB Config Notice]: Your MONGO_URI contains placeholder '<username>' or '<password>'.");
    throw new Error("MONGO_URI contains placeholder credentials");
  }

  try {
    cachedPromise = mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    const conn = await cachedPromise;
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    cachedPromise = null;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV !== "production" && require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Reconnection will be handled on next request.");
  cachedPromise = null;
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected.");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination.");
  process.exit(0);
});

module.exports = connectDB;

