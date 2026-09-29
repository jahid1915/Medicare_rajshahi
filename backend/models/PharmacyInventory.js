const mongoose = require("mongoose");

const pharmacyInventorySchema = new mongoose.Schema({
  pharmacy_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pharmacy",
    required: true,
    index: true
  },
  medicine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
    index: true
  },
  stock_quantity: { type: Number, required: true, default: 0, min: 0 },
  reserved_quantity: { type: Number, default: 0, min: 0 },
  available_quantity: { type: Number, default: 0 },
  unit_price: { type: Number, required: true, min: 0 },
  discounted_price: { type: Number, default: null },
  batch_number: { type: String, default: "" },
  expiry_date: { type: Date, default: null, index: true },
  in_stock: { type: Boolean, default: true, index: true },
  reorder_level: { type: Number, default: 20 },
  stock_status: {
    type: String,
    enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "EXPIRED"],
    default: "IN_STOCK",
    index: true
  },
  demand_trend: {
    type: String,
    enum: ["Surging", "High Demand", "Stable", "Low Demand"],
    default: "Stable"
  },
  trend_reason: { type: String, default: "" },
  risk_level: {
    type: String,
    enum: ["Critical Shortage", "Surge Warning", "Normal", "Overstocked"],
    default: "Normal"
  },
  last_updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

pharmacyInventorySchema.index({ pharmacy_id: 1, medicine_id: 1 }, { unique: true });
pharmacyInventorySchema.index({ pharmacy_id: 1, stock_status: 1 });
pharmacyInventorySchema.index({ in_stock: 1, stock_quantity: 1 });

// Automatic calculation of available quantity and stock status
pharmacyInventorySchema.pre("save", function (next) {
  const stock = this.stock_quantity || 0;
  const reserved = this.reserved_quantity || 0;
  const available = Math.max(0, stock - reserved);
  this.available_quantity = available;

  const now = new Date();
  if (this.expiry_date && new Date(this.expiry_date) < now) {
    this.stock_status = "EXPIRED";
    this.in_stock = false;
  } else if (available <= 0) {
    this.stock_status = "OUT_OF_STOCK";
    this.in_stock = false;
  } else if (available <= (this.reorder_level || 20)) {
    this.stock_status = "LOW_STOCK";
    this.in_stock = true;
  } else {
    this.stock_status = "IN_STOCK";
    this.in_stock = true;
  }

  next();
});

module.exports = mongoose.model("PharmacyInventory", pharmacyInventorySchema);
