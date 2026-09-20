const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  medicine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true
  },
  brand_name: { type: String, required: true },
  generic_name: { type: String, default: "" },
  dosage_form: { type: String, default: "Tablet" },
  strength: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true, min: 0 },
  total_price: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: "" }
}, { _id: false });

const pharmacyOrderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    unique: true,
    required: true,
    default: () => "ORD-RX-" + Date.now().toString(36).toUpperCase()
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  pharmacy_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pharmacy",
    required: true,
    index: true
  },
  items: [orderItemSchema],
  prescription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription",
    default: null
  },
  prescription_required: { type: Boolean, default: false },
  prescription_image: { type: String, default: null },
  prescription_verified: { type: Boolean, default: false },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  
  subtotal: { type: Number, required: true, min: 0 },
  delivery_fee: { type: Number, default: 40 },
  discount: { type: Number, default: 0 },
  total_amount: { type: Number, required: true, min: 0 },

  delivery_address: {
    recipient_name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, default: "Rajshahi" },
    additional_notes: { type: String, default: "" }
  },
  delivery_type: {
    type: String,
    enum: ["home_delivery", "pickup"],
    default: "home_delivery"
  },
  payment_method: {
    type: String,
    enum: ["cash_on_delivery", "bkash", "nagad", "card", "sslcommerz"],
    default: "cash_on_delivery"
  },
  payment_status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
    default: "pending",
    index: true
  },
  timeline: [orderTimelineSchema],
  cancel_reason: { type: String, default: "" },
  notes: { type: String, default: "" }
}, { timestamps: true });

pharmacyOrderSchema.index({ pharmacy_id: 1, status: 1, createdAt: -1 });
pharmacyOrderSchema.index({ patient_id: 1, createdAt: -1 });

module.exports = mongoose.model("PharmacyOrder", pharmacyOrderSchema);
