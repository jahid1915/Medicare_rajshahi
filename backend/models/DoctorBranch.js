const mongoose = require("mongoose");

const doctorBranchSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    default: "Rajshahi",
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  roomNumber: {
    type: String,
    trim: true,
    default: ""
  },
  consultationFee: {
    type: Number,
    default: 800
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

doctorBranchSchema.index({ doctorId: 1, active: 1 });

module.exports = mongoose.model("DoctorBranch", doctorBranchSchema);
