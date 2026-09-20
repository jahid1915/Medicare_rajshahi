const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actor_id:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  actor_name: { type: String },
  actor_role: { type: String },
  action:     { type: String, required: true },
  resource_type: { type: String },
  resource_id:   { type: mongoose.Schema.Types.ObjectId },
  old_value:  { type: mongoose.Schema.Types.Mixed },
  new_value:  { type: mongoose.Schema.Types.Mixed },
  ip_address: { type: String },
  user_agent: { type: String },
  detail:     { type: String }
}, { timestamps: true });

auditLogSchema.index({ actor_id: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource_type: 1, resource_id: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
