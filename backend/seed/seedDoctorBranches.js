require("dotenv").config();
const connectDB = require("../config/db");
const Doctor = require("../models/Doctor");
const DoctorBranch = require("../models/DoctorBranch");
const DoctorSchedule = require("../models/DoctorSchedule");

async function seedDoctorBranches() {
  await connectDB();
  console.log("Seeding Doctor Branches & Weekly Schedules for Rajshahi Doctors...");

  const doctors = await Doctor.find({ is_active: true });
  console.log(`Found ${doctors.length} doctors.`);

  let createdBranches = 0;
  let createdSchedules = 0;

  for (const doc of doctors) {
    const existing = await DoctorBranch.find({ doctorId: doc._id });
    if (existing.length > 0) continue;

    const chambers = (doc.chambers && doc.chambers.length > 0)
      ? doc.chambers
      : [{
          name: doc.workplace || "Rajshahi Main Specialized Chamber",
          address: "Medical College Road, Laxmipur, Rajshahi",
          visiting_hours: "05:00 PM - 09:00 PM",
          appointment_numbers: ["01711223344"]
        }];

    for (let i = 0; i < chambers.length; i++) {
      const ch = chambers[i];
      const branch = await DoctorBranch.create({
        doctorId: doc._id,
        name: ch.name || `Rajshahi Chamber ${i + 1}`,
        address: ch.address || "Medical College Road, Rajshahi",
        city: "Rajshahi",
        phone: (ch.appointment_numbers && ch.appointment_numbers[0]) || "01711223344",
        consultationFee: doc.consultation_fee || 800,
        roomNumber: `Chamber Room ${101 + i}`,
        active: true
      });
      createdBranches++;

      // Seed 5 days schedule (Sun to Thu)
      for (let day = 0; day <= 4; day++) {
        await DoctorSchedule.create({
          doctorId: doc._id,
          branchId: branch._id,
          dayOfWeek: day,
          dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day],
          startTime: "05:00 PM",
          endTime: "09:00 PM",
          slotDuration: 20,
          maxPatients: 12,
          consultationType: "both",
          active: true
        });
        createdSchedules++;
      }
    }
  }

  console.log(`✅ Seed Completed: Created ${createdBranches} branches and ${createdSchedules} schedules.`);
  process.exit(0);
}

if (require.main === module) {
  seedDoctorBranches().catch(err => {
    console.error("Error seeding branches:", err);
    process.exit(1);
  });
}

module.exports = seedDoctorBranches;
