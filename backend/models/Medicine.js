const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  brand_name: { type: String, required: true, trim: true, index: true },
  generic_name: { type: String, required: true, trim: true, index: true },
  category: {
    type: String,
    required: true,
    enum: [
      "Analgesic & Antipyretic",
      "Gastrointestinal",
      "Antibiotic",
      "Antihistamine",
      "Cardiovascular",
      "Antidiabetic",
      "Vitamin & Mineral",
      "Respiratory",
      "Dermatological",
      "Neurological & Psychiatric",
      "Ophthalmic",
      "Emergency & Critical",
      "Other"
    ],
    index: true
  },
  manufacturer: { type: String, required: true, trim: true, index: true },
  dosage_form: {
    type: String,
    required: true,
    enum: [
      "Tablet",
      "Capsule",
      "Syrup",
      "Suspension",
      "Injection",
      "Ointment",
      "Eye Drops",
      "Inhaler",
      "Sachet",
      "Powder",
      "Other"
    ],
    default: "Tablet"
  },
  strength: { type: String, required: true, trim: true },
  unit: { type: String, default: "strip of 10" },
  unit_price: { type: Number, default: 0 },
  requires_prescription: { type: Boolean, default: false },
  is_otc: { type: Boolean, default: true },
  description: { type: String, default: "" },
  indications: { type: String, default: "" },
  dosage_guidelines: { type: String, default: "" },
  side_effects: { type: String, default: "" },
  precautions: { type: String, default: "" },
  image_url: { type: String, default: null },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

medicineSchema.index({
  brand_name: "text",
  generic_name: "text",
  manufacturer: "text",
  category: "text"
});

module.exports = mongoose.model("Medicine", medicineSchema);
