const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:     { type: String, default: "Patient", trim: true },
  email:    { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone:    { type: String, unique: true, sparse: true, trim: true, index: true },
  password: { type: String, select: false, default: null },
  role: {
    type: String,
    enum: [
      "patient",
      "doctor",
      "specialist_doctor",
      "pharmacy_owner",
      "pharmacist",
      "hospital_admin",
      "hospital_management",
      "nurse",
      "lab_tech",
      "radiology_tech",
      "receptionist",
      "ambulance_op",
      "researcher",
      "compliance_auditor",
      "super_admin"
    ],
    default: "patient"
  },

  // Basic Information
  date_of_birth:     { type: Date },
  gender:            { type: String, enum: ["male", "female", "other"] },
  address:           { type: String, trim: true },
  blood_group:       { type: String, trim: true },
  profile_picture:   { type: String },
  preferred_language:{ type: String, default: "bn" },

  // Emergency Information
  emergency_contact:        { type: String, trim: true },
  emergency_contact_name:   { type: String, trim: true },
  emergency_contact_relation:{ type: String, trim: true },
  emergency_contact_phone:  { type: String, trim: true },

  // Medical Information
  allergies:            { type: String, trim: true, default: "" },
  existing_conditions:  { type: String, trim: true, default: "" },
  previous_surgeries:   { type: String, trim: true, default: "" },
  current_medications:  { type: String, trim: true, default: "" },
  medical_history:      { type: String, trim: true, default: "" },

  // Organization references — restricts access to their own entity
  hospital_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  pharmacy_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" },

  is_active:         { type: Boolean, default: true },
  is_verified:       { type: Boolean, default: false },
  is_email_verified: { type: Boolean, default: false },
  last_login:        { type: Date }
}, { timestamps: true });


// Hash password before save
userSchema.pre("save", async function(next) {
  if (!this.password || !this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate patient profile completion percentage and missing fields
userSchema.methods.calculateProfileCompletion = function() {
  const fields = [
    { key: "name", label: "Full Name", filled: !!(this.name && this.name !== "Patient") },
    { key: "phone", label: "Phone Number", filled: !!this.phone },
    { key: "date_of_birth", label: "Date of Birth", filled: !!this.date_of_birth },
    { key: "gender", label: "Gender", filled: !!this.gender },
    { key: "blood_group", label: "Blood Group", filled: !!this.blood_group },
    { key: "address", label: "Address", filled: !!(this.address && this.address.trim()) },
    { key: "emergency_contact", label: "Emergency Contact", filled: !!(this.emergency_contact_phone || this.emergency_contact || this.emergency_contact_name) },
    { key: "medical_history", label: "Medical Information", filled: !!(this.allergies || this.existing_conditions || this.medical_history) }
  ];

  const total = fields.length;
  const filledCount = fields.filter(f => f.filled).length;
  const percentage = Math.round((filledCount / total) * 100);
  const missing = fields.filter(f => !f.filled).map(f => f.label);

  return { percentage, missing, isComplete: percentage >= 80 };
};

// Remove password from JSON output and include profile completion for patients
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  if (this.role === "patient" && typeof this.calculateProfileCompletion === "function") {
    obj.profile_completion = this.calculateProfileCompletion();
  }
  return obj;
};

module.exports = mongoose.model("User", userSchema);



