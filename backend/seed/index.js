require("dotenv").config();
const connectDB = require("../config/db");

const seedHospitals = require("./hospitals");
const seedPharmaciesAndMedicines = require("./pharmaciesAndMedicines");
const seedDoctors = require("./doctors");

async function runAllSeeds() {
  try {
    await connectDB();
    console.log("\n=== Medicare Rajshahi Seed Runner ===");

    await seedHospitals();
    await seedPharmaciesAndMedicines();
    await seedDoctors();

    console.log("\n=== Seeding Complete ===\n");
    process.exit(0);
  } catch (err) {
    console.error("Seed Error:", err.message);
    process.exit(1);
  }
}

runAllSeeds();
