const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, trim: true },
  password: { type: String, required: true, select: false },
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

  // Patient profile fields
  date_of_birth: { type: Date },
  gender:        { type: String, enum: ["male", "female", "other"] },
  address:       { type: String, trim: true },
  blood_group:   { type: String },

  // Organization references — restricts access to their own entity
  hospital_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  pharmacy_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" },

  is_active:       { type: Boolean, default: true },
  is_verified:     { type: Boolean, default: false },
  last_login:      { type: Date },
  profile_picture: { type: String }
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
