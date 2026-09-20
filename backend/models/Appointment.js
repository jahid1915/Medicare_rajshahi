const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient_id:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  facility_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  chamber_index: { type: Number, default: 0 },

  appointment_date: { type: Date, required: true },
  time_slot:        { type: String, required: true }, // "07:30 PM"

  consultation_type: {
    type: String,
    enum: ["in_person","video_call","phone_call"],
    default: "in_person"
  },
  consultation_fee: { type: Number, required: true },
  currency:         { type: String, default: "BDT" },

  order_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

  status: {
    type: String,
    enum: ["pending","awaiting_payment","confirmed","completed","cancelled","no_show"],
    default: "pending"
  },

  // Patient info at time of booking (denormalized for speed)
  patient_name:   { type: String },
  patient_phone:  { type: String },
  family_member_name: { type: String },

  symptoms:         { type: String },
  ai_triage_summary:{ type: String },
  doctor_notes:     { type: String },

  cancelled_at:   { type: Date },
  cancel_reason:  { type: String },
  completed_at:   { type: Date }

}, { timestamps: true });

appointmentSchema.index({ patient_id: 1, appointment_date: -1 });
appointmentSchema.index({ doctor_id: 1, appointment_date: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
