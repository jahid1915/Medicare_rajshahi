const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    index: true
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
    required: true
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

// Compound indexes to quickly find active verification requests
otpVerificationSchema.index({ phone: 1, purpose: 1, verified: 1 });
otpVerificationSchema.index({ email: 1, purpose: 1, verified: 1 });
otpVerificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);

