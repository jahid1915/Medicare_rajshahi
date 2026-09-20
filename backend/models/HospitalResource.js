const mongoose = require("mongoose");

const RESOURCE_TYPES = [
  "general_bed","cabin","ac_cabin","non_ac_cabin",
  "icu","ccu","nicu","picu","hdu",
  "emergency_bed","isolation_bed","burn_bed",
  "operation_theatre","dialysis_unit",
  "ambulance","oxygen_unit","ventilator"
];

const RESOURCE_STATUSES = ["available","limited","full","unavailable","maintenance","unknown"];

const hospitalResourceSchema = new mongoose.Schema({
  hospital_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  resource_type: { type: String, enum: RESOURCE_TYPES, required: true },
  resource_name: { type: String, required: true },

  // Capacity data — null means data not provided (never fake)
  total_capacity: { type: Number, default: null },
  available_count:{ type: Number, default: null },
  occupied_count: { type: Number, default: null },
  reserved_count: { type: Number, default: 0 },
  maintenance_count: { type: Number, default: 0 },

  // Derived — auto-calculated on update
  occupancy_percentage: { type: Number, default: null },

  status: { type: String, enum: RESOURCE_STATUSES, default: "unknown" },

  // Booking config
  is_bookable:    { type: Boolean, default: false },
  booking_policy: {
    type: String,
    enum: ["online_booking","request_only","hospital_confirmation_required","information_only"],
    default: "information_only"
  },
  price_per_day: { type: Number, default: null },

  // Data quality tracking
  last_updated:       { type: Date, default: null },
  updated_by:         { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  source: {
    type: String,
    enum: ["hospital_admin","manual","api","system"],
    default: "manual"
  },
  verification_status: {
    type: String,
    enum: ["verified","hospital_verified","admin_verified","unverified","stale"],
    default: "unverified"
  }

}, { timestamps: true });

// Auto-calculate occupancy and status before save
hospitalResourceSchema.pre("save", function(next) {
  if (this.total_capacity != null && this.available_count != null) {
    const occupied = this.total_capacity - this.available_count;
    this.occupied_count = occupied;
    this.occupancy_percentage = Math.round((occupied / this.total_capacity) * 100);

    const pct = this.occupancy_percentage;
    if (pct >= 100) this.status = "full";
    else if (pct >= 80) this.status = "limited";
    else if (pct >= 0)  this.status = "available";
  }
  next();
});

hospitalResourceSchema.index({ hospital_id: 1 });
hospitalResourceSchema.index({ hospital_id: 1, resource_type: 1 });
hospitalResourceSchema.index({ status: 1 });

module.exports = mongoose.model("HospitalResource", hospitalResourceSchema);
