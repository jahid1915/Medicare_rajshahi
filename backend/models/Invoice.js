const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoice_number: { type: String, unique: true },

  order_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Snapshot at time of invoice (denormalized)
  patient_name:   { type: String },
  provider_name:  { type: String },
  service_description: { type: String },

  items: [{
    description: String,
    quantity:    Number,
    unit_price:  Number,
    total:       Number
  }],

  subtotal:       { type: Number, required: true },
  discount:       { type: Number, default: 0 },
  platform_fee:   { type: Number, default: 0 },
  total_amount:   { type: Number, required: true },
  amount_paid:    { type: Number, default: 0 },
  amount_remaining: { type: Number, default: 0 },
  currency:       { type: String, default: "BDT" },

  payment_method: { type: String },
  transaction_id: { type: String },
  paid_at:        { type: Date },

  status: {
    type: String,
    enum: ["draft","issued","paid","partially_paid","cancelled"],
    default: "issued"
  }

}, { timestamps: true });

invoiceSchema.pre("save", function(next) {
  if (!this.invoice_number) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(Math.random() * 9000) + 1000;
    this.invoice_number = `INV-${date}-${rand}`;
  }
  next();
});

invoiceSchema.index({ order_id: 1 });
invoiceSchema.index({ patient_id: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
