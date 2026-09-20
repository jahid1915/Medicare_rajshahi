const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("\n❌ [MongoDB Error]: MONGO_URI is not defined in backend/.env!");
      console.error("👉 Please create 'backend/.env' and paste your MongoDB Atlas connection string.\n");
      process.exit(1);
    }

    if (uri.includes("<username>") || uri.includes("<password>")) {
      console.error("\n⚠️ [MongoDB Config Notice]: Your MONGO_URI still contains placeholder '<username>' or '<password>'.");
      console.error("👉 Replace <username> and <password> in backend/.env with your actual database user credentials.\n");
      process.exit(1);
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
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
