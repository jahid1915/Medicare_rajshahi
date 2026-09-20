const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, trim: true, lowercase: true },
  license_number: { type: String, trim: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  phone: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, required: true },
  area: { type: String, required: true, trim: true },
  city: { type: String, default: "Rajshahi", trim: true },
  district: { type: String, default: "Rajshahi", trim: true },
  latitude: { type: Number, default: 24.3745 },
  longitude: { type: Number, default: 88.6042 },
  rating: { type: Number, default: 4.8, min: 0, max: 5 },
  review_count: { type: Number, default: 0 },
  is_verified: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true },
  is_24_7: { type: Boolean, default: false },
  opening_hours: {
    open: { type: String, default: "08:00 AM" },
    close: { type: String, default: "11:00 PM" }
  },
  delivery_available: { type: Boolean, default: true },
  delivery_eta_mins: { type: Number, default: 30 },
  delivery_fee: { type: Number, default: 40 },
  free_delivery_above: { type: Number, default: 500 },
  banner_image: { type: String, default: null },
  featured_notice: { type: String, default: null },
  accepted_payment_methods: [{
    type: String,
    enum: ["cash_on_delivery", "bkash", "nagad", "card", "sslcommerz"]
  }]
}, { timestamps: true });

pharmacySchema.index({ name: "text", address: "text", area: "text" });
pharmacySchema.index({ city: 1, area: 1, is_active: 1 });
pharmacySchema.index({ owner_id: 1 });

module.exports = mongoose.model("Pharmacy", pharmacySchema);
