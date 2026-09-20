/**
 * MongoDB Atlas Connection Diagnostic Script
 * Usage: node test-db.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  console.log("\n==========================================");
  console.log(" 🩺 Medicare - MongoDB Atlas Diagnostic");
  console.log("==========================================\n");

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ ERROR: MONGO_URI is missing in backend/.env!");
    console.error("\n👉 Create a file named '.env' inside 'd:\\Medi\\backend\\' with:");
    console.error("   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/medicare_rajshahi?retryWrites=true&w=majority\n");
    process.exit(1);
  }

  // Mask credentials for display
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log(`Connecting to: ${maskedUri} ...`);

  if (uri.includes("<username>") || uri.includes("<password>")) {
    console.error("\n⚠️  NOTICE: Your MONGO_URI contains placeholders: <username> or <password>");
    console.error("👉 Please replace them with your actual Atlas Database User credentials.\n");
    process.exit(1);
  }

  try {
    const startTime = Date.now();
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    const elapsed = Date.now() - startTime;

    console.log(`\n✅ Successfully connected in ${elapsed}ms!`);
    console.log(`   Host:     ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   State:    Ready (code ${conn.connection.readyState})`);

    // Ping check
    await mongoose.connection.db.admin().ping();
    console.log("   Ping:     OK (Database responded to ping)");

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📦 Existing Collections (${collections.length}):`);
    if (collections.length === 0) {
      console.log("   (No collections yet. Run 'npm run seed' to populate Rajshahi hospitals!)");
    } else {
      collections.forEach(col => console.log(`   • ${col.name}`));
    }

    console.log("\n==========================================");
    console.log("🎉 Database connection is 100% operational!");
    console.log("==========================================\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Connection Failed!");
    console.error(`   Error message: ${err.message}`);

    console.log("\n🔍 Common Causes & Solutions:");
    if (err.message.includes("bad auth") || err.message.includes("Authentication failed")) {
      console.log("   1. Check your Atlas Database User username and password.");
      console.log("      (Note: This is the Database User created in 'Database Access', not your Atlas website login).");
      console.log("   2. If your password has special characters (@, #, %, etc.), URL-encode them.");
    } else if (err.message.includes("querySrv ENOTFOUND") || err.message.includes("ETIMEDOUT") || err.message.includes("buffering timed out")) {
      console.log("   1. IP Whitelist Issue: Go to MongoDB Atlas -> 'Network Access' -> Add IP Address -> Select 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0).");
      console.log("   2. Check your internet connection or corporate firewall/VPN blocking port 27017.");
    } else {
      console.log("   1. Verify your connection string format in backend/.env.");
      console.log("   2. Ensure Network Access has 0.0.0.0/0 enabled in MongoDB Atlas.");
    }
    console.log("");
    process.exit(1);
  }
}

testConnection();
