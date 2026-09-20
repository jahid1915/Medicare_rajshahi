const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  user_id:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name:        { type: String, required: true },
  title:       { type: String },
  degrees:     { type: String },
  specialization: { type: String, required: true },
  specialty_id:   { type: String },

  // Primary hospital/clinic
  hospital_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  hospital_name:{ type: String },

  experience_years: { type: Number },
  consultation_fee: { type: Number },
  currency:         { type: String, default: "BDT" },

  // Location
  city:     { type: String, default: "Rajshahi" },
  district: { type: String, default: "Rajshahi" },
  area:     { type: String },

  bio:       { type: String },
  languages: [{ type: String }],
  avatar:    { type: String },
  rating:    { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },

  is_verified:  { type: Boolean, default: false },
  is_active:    { type: Boolean, default: true },
  available_for_telemedicine: { type: Boolean, default: false },

  // Chambers / schedules (embedded for simplicity)
  chambers: [{
    facility_name:   { type: String },
    facility_id:     { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    address:         { type: String },
    schedule: [{
      day:        { type: String }, // "Saturday", "Sunday" etc
      start_time: { type: String }, // "08:00"
      end_time:   { type: String }  // "13:00"
    }],
    consultation_fee: { type: Number }
  }]

}, { timestamps: true });

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ city: 1, district: 1 });
doctorSchema.index({ hospital_id: 1 });
doctorSchema.index({ is_verified: 1, is_active: 1 });
doctorSchema.index({ name: "text", specialization: "text" });

module.exports = mongoose.model("Doctor", doctorSchema);
