const mongoose = require("mongoose");

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
    index: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DoctorBranch",
    required: true,
    index: true
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    required: true,
    min: 0,
    max: 6
  },
  dayName: {
    type: String, // "Sunday", "Monday", etc.
    trim: true
  },
  startTime: {
    type: String, // e.g., "05:00 PM" or "17:00"
    required: true
  },
  endTime: {
    type: String, // e.g., "09:00 PM" or "21:00"
    required: true
  },
  slotDuration: {
    type: Number, // in minutes, default 20
    default: 20
  },
  maxPatients: {
    type: Number,
    default: 20
  },
  consultationType: {
    type: String,
    enum: ["in_person", "online", "both"],
    default: "both"
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

doctorScheduleSchema.index({ doctorId: 1, branchId: 1, dayOfWeek: 1, active: 1 });

module.exports = mongoose.model("DoctorSchedule", doctorScheduleSchema);
