const mongoose = require("mongoose");

const prescriptionMedicineItemSchema = new mongoose.Schema({
  medicine_name: { type: String, required: true },
  generic_name: { type: String, default: "" },
  dosage: { type: String, required: true }, // e.g., '1+0+1', '1+1+1'
  duration: { type: String, required: true }, // e.g., '7 days', '1 month'
  timing: { type: String, default: "After meal" }, // 'After meal', 'Before meal'
  instructions: { type: String, default: "" }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  prescription_number: {
    type: String,
    unique: true,
    required: true,
    default: () => "RX-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 900 + 100)
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: null
  },
  doctor_name: { type: String, default: "Attending Physician" },
  doctor_specialization: { type: String, default: "General Medicine" },
  doctor_bmdc_reg: { type: String, default: "" },
  hospital_name: { type: String, default: "" },
  diagnosis: { type: String, default: "" },
  chief_complaints: { type: String, default: "" },
  vitals: {
    blood_pressure: { type: String, default: "" },
    pulse: { type: String, default: "" },
    temperature: { type: String, default: "" },
    weight: { type: String, default: "" }
  },
  medicines: [prescriptionMedicineItemSchema],
  tests_advised: [{ type: String }],
  advice: { type: String, default: "" },
  follow_up_date: { type: Date, default: null },
  file_url: { type: String, default: null },
  source_type: {
    type: String,
    enum: ["teleconsultation", "in_person", "patient_upload"],
    default: "teleconsultation"
  },
  is_verified: { type: Boolean, default: true },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

prescriptionSchema.index({ patient_id: 1, createdAt: -1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
