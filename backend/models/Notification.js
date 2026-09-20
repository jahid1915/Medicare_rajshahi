const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "appointment_confirmed","appointment_reminder","appointment_cancelled",
      "payment_successful","payment_failed","refund_processed",
      "hospital_booking_confirmed","invoice_generated","resource_updated",
      "general"
    ],
    required: true
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  reference_id:   { type: mongoose.Schema.Types.ObjectId },
  reference_type: { type: String },
  channels: { type: [String], enum: ["in_app","email","sms","push"], default: ["in_app"] }
}, { timestamps: true });

notificationSchema.index({ user_id: 1, is_read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
