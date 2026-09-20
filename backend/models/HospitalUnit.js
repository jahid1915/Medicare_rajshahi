const mongoose = require("mongoose");

const hospitalUnitSchema = new mongoose.Schema({
  hospital_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  resource_id:   { type: mongoose.Schema.Types.ObjectId, ref: "HospitalResource", required: true },
  resource_type: { type: String, required: true },
  unit_code:     { type: String, required: true }, // e.g. "CABIN-102"
  unit_name:     { type: String },
  floor:         { type: String },
  ward:          { type: String },
  category:      { type: String }, // "AC", "Non-AC", "VIP" etc
  price_per_day: { type: Number, default: null },
  status: {
    type: String,
    enum: ["available","occupied","reserved","maintenance","unavailable"],
    default: "available"
  },
  is_bookable:    { type: Boolean, default: true },
  current_patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  notes: { type: String }
}, { timestamps: true });

hospitalUnitSchema.index({ hospital_id: 1, resource_type: 1, status: 1 });
hospitalUnitSchema.index({ unit_code: 1, hospital_id: 1 }, { unique: true });

module.exports = mongoose.model("HospitalUnit", hospitalUnitSchema);
