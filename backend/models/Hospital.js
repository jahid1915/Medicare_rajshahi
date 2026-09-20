const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  short_name: { type: String, trim: true },
  type: {
    type: String,
    enum: ["government", "private", "clinic", "ngo"],
    required: true
  },
  // Location — Rajshahi first, then nationwide
  city:       { type: String, default: "Rajshahi" },
  district:   { type: String, default: "Rajshahi" },
  division:   { type: String, default: "Rajshahi" },
  area:       { type: String },
  address:    { type: String },
  latitude:   { type: Number, default: null },
  longitude:  { type: Number, default: null },

  // Contact
  phone:           { type: String, default: null },
  emergency_phone: { type: String, default: null },
  email:           { type: String, default: null },
  website:         { type: String, default: null },

  // Verification
  is_verified:        { type: Boolean, default: false },
  verification_level: {
    type: String,
    enum: ["verified", "hospital_verified", "admin_verified", "unverified"],
    default: "unverified"
  },
  verified_at: { type: Date, default: null },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Key Facilities (top-level flags for quick filtering)
  has_icu:        { type: Boolean, default: false },
  has_ccu:        { type: Boolean, default: false },
  has_nicu:       { type: Boolean, default: false },
  has_picu:       { type: Boolean, default: false },
  has_emergency:  { type: Boolean, default: false },
  has_blood_bank: { type: Boolean, default: false },
  has_pharmacy:   { type: Boolean, default: false },
  has_diagnostic: { type: Boolean, default: false },
  has_ambulance:  { type: Boolean, default: false },
  has_dialysis:   { type: Boolean, default: false },

  // Approximate bed count — exact from HospitalResource collection
  bed_count_approx: { type: Number, default: null },

  // Services list
  services: [{ type: String }],

  description: { type: String },
  is_active:   { type: Boolean, default: true },

  // Admin reference
  admin_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }

}, { timestamps: true });

// Indexes for common queries
hospitalSchema.index({ city: 1, district: 1 });
hospitalSchema.index({ type: 1 });
hospitalSchema.index({ is_verified: 1 });
hospitalSchema.index({ has_icu: 1, has_emergency: 1 });
hospitalSchema.index({ name: "text", area: "text" }); // text search

module.exports = mongoose.model("Hospital", hospitalSchema);
