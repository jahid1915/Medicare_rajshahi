const mongoose = require("mongoose");

// ─── Chamber Sub-Schema ───────────────────────────────────────────────────
const chamberSchema = new mongoose.Schema({
  name:                { type: String },
  address:             { type: String },
  visiting_hours:      { type: String },
  appointment_numbers: [{ type: String }]
}, { _id: false });

// ─── Doctor Schema ────────────────────────────────────────────────────────
const doctorSchema = new mongoose.Schema({
  // Core identity
  name:             { type: String, required: true, trim: true },
  slug:             { type: String, required: true, unique: true, lowercase: true, trim: true },

  // Professional info
  specialty:        { type: String, trim: true, default: "General Practice" },
  qualifications:   { type: String, trim: true },
  training:         { type: String, trim: true },
  designation:      { type: String, trim: true },
  workplace:        { type: String, trim: true },
  experience:       { type: String, trim: true },

  // Verification & Ratings
  bmdcRegistration: { type: String, trim: true },
  verified:         { type: Boolean, default: false },
  rating:           { type: Number, default: null, min: 0, max: 5 },
  reviewCount:      { type: Number, default: 0 },

  // Chambers
  chambers:         [chamberSchema],

  // Media & Source
  imageUrl:         { type: String, trim: true },
  profileUrl:       { type: String, trim: true },
  source:           { type: String, default: "BDDoctorDirectory" },
  lastScraped:      { type: Date },

  // Location
  city:             { type: String, default: "Rajshahi" },
  country:          { type: String, default: "Bangladesh" },

  // Admin fields (for future use)
  is_active:        { type: Boolean, default: true },
  isOutdated:       { type: Boolean, default: false },
  adminNotes:       { type: String },

  // Legacy fields (kept for backward compatibility with appointment system)
  user_id:          { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hospital_id:      { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  consultation_fee: { type: Number },
  currency:         { type: String, default: "BDT" },
  available_for_telemedicine: { type: Boolean, default: false },

}, { timestamps: true });

// ─── Indexes ──────────────────────────────────────────────────────────────
// Note: slug unique index is auto-created by `unique: true` in the schema field
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ workplace: 1 });
doctorSchema.index({ verified: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ city: 1 });
doctorSchema.index({ profileUrl: 1 }, { sparse: true });
doctorSchema.index({ bmdcRegistration: 1 }, { sparse: true });
doctorSchema.index(
  { name: "text", specialty: "text", qualifications: "text", designation: "text", workplace: "text" },
  { weights: { name: 10, specialty: 5, designation: 3, qualifications: 2, workplace: 2 } }
);

module.exports = mongoose.model("Doctor", doctorSchema);
