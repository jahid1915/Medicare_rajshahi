const mongoose = require("mongoose");

const inventoryAuditSchema = new mongoose.Schema({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pharmacy",
    required: true,
    index: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  action: {
    type: String,
    enum: [
      "STOCK_ADDED",
      "STOCK_REMOVED",
      "STOCK_UPDATED",
      "EXPIRED",
      "MANUAL_ADJUSTMENT",
      "ORDER_RESERVED",
      "ORDER_RELEASED",
      "ORDER_SOLD",
      "EXCEL_IMPORT"
    ],
    required: true
  },
  previousQuantity: {
    type: Number,
    default: 0
  },
  newQuantity: {
    type: Number,
    required: true
  },
  batchNumber: {
    type: String,
    default: ""
  },
  reason: {
    type: String,
    trim: true,
    default: ""
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

inventoryAuditSchema.index({ pharmacyId: 1, medicineId: 1, timestamp: -1 });

module.exports = mongoose.model("InventoryAudit", inventoryAuditSchema);
