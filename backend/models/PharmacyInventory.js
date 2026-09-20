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
  unit_price: { type: Number, required: true, min: 0 },
  discounted_price: { type: Number, default: null },
  batch_number: { type: String, default: "" },
  expiry_date: { type: Date, default: null },
  in_stock: { type: Boolean, default: true },
  reorder_level: { type: Number, default: 20 },
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
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

pharmacyInventorySchema.index({ pharmacy_id: 1, medicine_id: 1 }, { unique: true });
pharmacyInventorySchema.index({ in_stock: 1, stock_quantity: 1 });

pharmacyInventorySchema.pre("save", function (next) {
  this.in_stock = this.stock_quantity > 0;
  next();
});

module.exports = mongoose.model("PharmacyInventory", pharmacyInventorySchema);
