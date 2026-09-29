const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  // Identifiers
  appointmentId: {
    type: String,
    unique: true,
    sparse: true
  },
  serialNumber: {
    type: String,
    sparse: true // e.g., NRM-2026-0925-0042
  },

  // Core References (Supporting both camelCase and snake_case for maximum compatibility)
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", index: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },

  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorBranch", index: true },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorBranch" },
  facility_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  chamber_index: { type: Number, default: 0 },

  // Schedule Info
  appointmentDate: { type: Date, required: true },
  appointment_date: { type: Date },
  startTime: { type: String }, // e.g., "10:20 AM"
  endTime: { type: String },
  time_slot: { type: String, required: true }, // "10:20 AM"

  appointmentType: {
    type: String,
    enum: [
      "Online Consultation",
      "In-person Consultation",
      "in_person",
      "video_call",
      "phone_call",
      "online",
      "ONLINE",
      "IN_PERSON",
      "ONLINE_CONSULTATION",
      "IN_PERSON_CONSULTATION"
    ],
    default: "Online Consultation"
  },
  consultation_type: {
    type: String,
    default: "in_person"
  },

  consultationFee: { type: Number, required: true, default: 800 },
  consultation_fee: { type: Number, default: 800 },
  currency: { type: String, default: "BDT" },

  // Statuses
  status: {
    type: String,
    enum: [
      "PENDING_PAYMENT",
      "CONFIRMED",
      "CANCELLED",
      "EXPIRED",
      "COMPLETED",
      "NO_SHOW",
      "RESCHEDULED",
      "pending",
      "awaiting_payment",
      "confirmed",
      "completed",
      "cancelled",
      "no_show"
    ],
    default: "PENDING_PAYMENT",
    index: true
  },

  paymentStatus: {
    type: String,
    enum: [
      "UNPAID",
      "PENDING",
      "PAID",
      "FAILED",
      "CANCELLED",
      "REFUNDED",
      "unpaid",
      "pending",
      "paid",
      "failed"
    ],
    default: "UNPAID",
    index: true
  },

  // Payment Tracking
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  sslTransactionId: { type: String, index: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

  // Temporary Slot Hold
  holdExpiresAt: {
    type: Date,
    index: true
  },

  // Confirmation & Delivery
  emailDeliveryStatus: {
    type: String,
    enum: ["PENDING", "SENT", "FAILED"],
    default: "PENDING"
  },
  pdfUrl: { type: String, default: null },

  // Patient Snapshot
  patientName: { type: String },
  patient_name: { type: String },
  patientEmail: { type: String },
  patientPhone: { type: String },
  patient_phone: { type: String },
  gender: { type: String },
  age: { type: String },
  address: { type: String },
  emergencyContact: { type: String },
  bloodGroup: { type: String },
  consultationReason: { type: String },

  // Legacy fields
  family_member_name: { type: String },
  symptoms: { type: String },
  ai_triage_summary: { type: String },
  doctor_notes: { type: String },

  cancelled_at: { type: Date },
  cancel_reason: { type: String },
  completed_at: { type: Date }

}, { timestamps: true });

// Auto-sync fields before save
appointmentSchema.pre("save", function(next) {
  if (!this.patient_id && this.patientId) this.patient_id = this.patientId;
  if (!this.patientId && this.patient_id) this.patientId = this.patient_id;

  if (!this.doctor_id && this.doctorId) this.doctor_id = this.doctorId;
  if (!this.doctorId && this.doctor_id) this.doctorId = this.doctor_id;

  if (!this.branch_id && this.branchId) this.branch_id = this.branchId;
  if (!this.branchId && this.branch_id) this.branchId = this.branch_id;

  if (!this.appointment_date && this.appointmentDate) this.appointment_date = this.appointmentDate;
  if (!this.appointmentDate && this.appointment_date) this.appointmentDate = this.appointment_date;

  if (!this.time_slot && this.startTime) this.time_slot = this.startTime;
  if (!this.startTime && this.time_slot) this.startTime = this.time_slot;

  if (!this.consultation_fee && this.consultationFee) this.consultation_fee = this.consultationFee;
  if (!this.consultationFee && this.consultation_fee) this.consultationFee = this.consultation_fee;

  if (!this.patient_name && this.patientName) this.patient_name = this.patientName;
  if (!this.patientName && this.patient_name) this.patientName = this.patient_name;

  if (!this.patient_phone && this.patientPhone) this.patient_phone = this.patientPhone;
  if (!this.patientPhone && this.patient_phone) this.patientPhone = this.patient_phone;

  if (!this.appointmentId) {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.appointmentId = `APT-${dateStr}-${rand}`;
  }

  next();
});

// Indexes for high performance and fast slot availability checks
appointmentSchema.index({ doctorId: 1, branchId: 1, appointmentDate: 1, time_slot: 1, status: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, holdExpiresAt: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
