const mongoose = require("mongoose");

// ─── Chamber Sub-Schema ───────────────────────────────────────────────────
const chamberSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  address: { type: String, trim: true },
  visiting_hours: { type: String, trim: true },
  visiting_hour: { type: String, trim: true },
  closed_day: { type: String, trim: true },
  appointment: { type: String, trim: true },
  appointment_numbers: [{ type: String, trim: true }],
  google_map: { type: String, trim: true }
}, { _id: false });

// ─── Doctor Schema ────────────────────────────────────────────────────────
const doctorSchema = new mongoose.Schema({
  // Core identity
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  normalized_name: { type: String, trim: true, index: true },
  source_names: [{ type: String, trim: true }],

  // Professional info
  specialty: { type: String, trim: true, default: "General Practice" },
  specialties: [{ type: String, trim: true }],
  qualifications: { type: String, trim: true },
  degrees: [{ type: String, trim: true }],
  fellowships: [{ type: String, trim: true }],
  training: { type: String, trim: true },
  education_training: [{ type: String, trim: true }],
  medical_focus: [{ type: String, trim: true }],
  designation: { type: String, trim: true },
  workplace: { type: String, trim: true },
  experience: { type: String, trim: true },
  biography: { type: String, trim: true },

  // Verification & Ratings
  bmdcRegistration: { type: String, trim: true },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: null, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  reviews_data: {
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    reviews: [{ type: String }]
  },
  profile_claim: { type: String, trim: true },

  // Chambers
  chambers: [chamberSchema],

  // Media & Source
  imageUrl: { type: String, trim: true },
  profileUrl: { type: String, trim: true },
  source: { type: String, default: "BDDoctorDirectory" },
  source_metadata: {
    name: { type: String, default: "MedicBD" },
    profile_url: { type: String, trim: true },
    last_imported_at: { type: Date }
  },
  lastScraped: { type: Date },

  // Location
  city: { type: String, default: "Rajshahi" },
  country: { type: String, default: "Bangladesh" },

  // Admin fields (for future use)
  is_active: { type: Boolean, default: true },
  isOutdated: { type: Boolean, default: false },
  adminNotes: { type: String },

  // Legacy fields (kept for backward compatibility with appointment system)
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  consultation_fee: { type: Number },
  currency: { type: String, default: "BDT" },
  available_for_telemedicine: { type: Boolean, default: false },

}, { timestamps: true });

// ─── Indexes ──────────────────────────────────────────────────────────────
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ specialties: 1 });
doctorSchema.index({ workplace: 1 });
doctorSchema.index({ verified: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ city: 1 });
doctorSchema.index({ profileUrl: 1 }, { sparse: true });
doctorSchema.index({ "source_metadata.profile_url": 1 }, { sparse: true });
doctorSchema.index({ bmdcRegistration: 1 }, { sparse: true });
doctorSchema.index(
  { name: "text", specialty: "text", qualifications: "text", designation: "text", workplace: "text", medical_focus: "text" },
  { weights: { name: 10, specialty: 5, designation: 3, qualifications: 2, workplace: 2, medical_focus: 2 } }
);

module.exports = mongoose.model("Doctor", doctorSchema);

