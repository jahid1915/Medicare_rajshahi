const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  otp_hash: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    default: "PATIENT_SIGNUP"
  },
  expires_at: {
    type: Date,
    required: true,
    index: true
  },
  attempt_count: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  resend_count: {
    type: Number,
    default: 0
  },
  last_resend_at: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Compound index to quickly find active verification requests
otpVerificationSchema.index({ email: 1, purpose: 1, verified: 1 });

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
