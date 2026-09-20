import React, { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  AlertCircle
} from "lucide-react";

export default function OrderManager({ orders = [], onUpdateStatus, onVerifyRx }) {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [rxPreviewModal, setRxPreviewModal] = useState(null);

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "pending") return order.status === "pending";
    if (selectedStatus === "active")
      return ["confirmed", "preparing", "out_for_delivery"].includes(order.status);
    if (selectedStatus === "delivered") return order.status === "delivered";
    if (selectedStatus === "cancelled") return order.status === "cancelled";
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", label: "Pending Confirmation" };
      case "confirmed":
        return { bg: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", label: "Order Confirmed" };
      case "preparing":
        return { bg: "rgba(168, 85, 247, 0.15)", color: "#c084fc", label: "Packing Medicines" };
      case "out_for_delivery":
        return { bg: "rgba(249, 115, 22, 0.15)", color: "#fb923c", label: "Out for Delivery" };
      case "delivered":
        return { bg: "rgba(74, 222, 128, 0.15)", color: "#4ade80", label: "Delivered & Paid" };
      case "cancelled":
        return { bg: "rgba(239, 68, 68, 0.15)", color: "#f87171", label: "Cancelled" };
      default:
        return { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8", label: status };
    }
  };

  return (
    <div>
      {/* Status Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto" }}>
        {[
          { id: "all", label: `All Orders (${orders.length})` },
          { id: "pending", label: "Pending" },
          { id: "active", label: "In Preparation & Delivery" },
          { id: "delivered", label: "Completed" },
          { id: "cancelled", label: "Cancelled" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border:
                selectedStatus === tab.id
                  ? "1px solid var(--teal-500, #0d9488)"
                  : "1px solid var(--border-color, #334155)",
              background:
                selectedStatus === tab.id
                  ? "rgba(13, 148, 136, 0.2)"
                  : "var(--card-bg, #1e293b)",
              color:
                selectedStatus === tab.id
                  ? "var(--teal-400, #2dd4bf)"
                  : "var(--text-secondary, #94a3b8)"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--card-bg, #1e293b)", borderRadius: "12px", border: "1px solid var(--border-color, #334155)" }}>
          <Package size={40} style={{ color: "var(--text-muted, #64748b)", margin: "0 auto 1rem" }} />
          <h3 style={{ margin: "0 0 0.5rem", color: "var(--text-primary, #f8fafc)" }}>No orders found</h3>
          <p style={{ margin: 0, color: "var(--text-secondary, #94a3b8)", fontSize: "0.9rem" }}>Orders received from patients will appear here in real-time.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {filteredOrders.map((order) => {
            const statusInfo = getStatusBadge(order.status);
            const addr = order.delivery_address || {};

            return (
              <div
                key={order._id || order.order_number}
                style={{
                  background: "var(--card-bg, #1e293b)",
                  border: "1px solid var(--border-color, #334155)",
                  borderRadius: "14px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                }}
              >
                {/* Top header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color, #334155)", paddingBottom: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary, #f8fafc)" }}>
                        {order.order_number || "ORD-RX-DEFAULT"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "6px",
                          background: statusInfo.bg,
                          color: statusInfo.color
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted, #64748b)" }}>
                      Placed {new Date(order.createdAt || Date.now()).toLocaleString("en-BD")}
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--teal-400, #2dd4bf)" }}>
                      ৳{order.total_amount}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #94a3b8)", textTransform: "capitalize" }}>
                      {order.payment_method?.replace(/_/g, " ")} ({order.payment_status || "pending"})
                    </span>
                  </div>
                </div>

                {/* Recipient info & Prescription badge */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1rem", fontSize: "0.85rem" }}>
                  <div style={{ background: "rgba(15, 23, 42, 0.5)", padding: "0.75rem 1rem", borderRadius: "8px" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary, #f8fafc)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                      <User size={14} /> {addr.recipient_name || "Patient"}
                    </div>
                    <div style={{ color: "var(--text-secondary, #94a3b8)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                      <Phone size={14} /> {addr.phone || "017XXXXXXXX"}
                    </div>
                    <div style={{ color: "var(--text-muted, #64748b)", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: "2px" }} /> {addr.street}, {addr.area || "Rajshahi"}
                    </div>
                  </div>

                  {/* Prescription verification status */}
                  {order.prescription_required && (
                    <div style={{ background: "rgba(15, 23, 42, 0.5)", padding: "0.75rem 1rem", borderRadius: "8px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: order.prescription_verified ? "#4ade80" : "#fbbf24", fontWeight: 700 }}>
                        {order.prescription_verified ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                        {order.prescription_verified ? "Prescription Verified by Pharmacist" : "Prescription Pending Verification"}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                        <button
                          onClick={() => setRxPreviewModal(order.prescription_image || "Uploaded Prescription Document")}
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.08)",
                            color: "#fff",
                            border: "none",
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                        >
                          View Rx Document
                        </button>
                        {!order.prescription_verified && (
                          <button
                            onClick={() => onVerifyRx(order._id)}
                            style={{
                              padding: "0.35rem 0.75rem",
                              borderRadius: "6px",
                              background: "#16a34a",
                              color: "#fff",
                              border: "none",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            Verify Rx
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items preview */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted, #94a3b8)", marginBottom: "0.4rem" }}>
                    Items Ordered:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary, #94a3b8)" }}>
                        <span>
                          {item.brand_name} ({item.strength}) × {item.quantity}
                        </span>
                        <span style={{ color: "var(--text-primary, #f8fafc)", fontWeight: 600 }}>
                          ৳{item.total_price || item.unit_price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status action workflow buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap", borderTop: "1px solid var(--border-color, #334155)", paddingTop: "1rem" }}>
                  {order.status === "pending" && (
                    <button
                      onClick={() => onUpdateStatus(order._id, "confirmed", "Pharmacy accepted the order")}
                      style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "var(--teal-600, #0d9488)", color: "#fff", border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      Confirm Order
                    </button>
                  )}

                  {order.status === "confirmed" && (
                    <button
                      onClick={() => onUpdateStatus(order._id, "preparing", "Pharmacist packing medicines and checking seals")}
                      style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "#8b5cf6", color: "#fff", border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      Pack Medicines
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button
                      onClick={() => onUpdateStatus(order._id, "out_for_delivery", "Handed to courier rider for delivery")}
                      style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "#f97316", color: "#fff", border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      Dispatch with Rider
                    </button>
                  )}

                  {order.status === "out_for_delivery" && (
                    <button
                      onClick={() => onUpdateStatus(order._id, "delivered", "Delivered to patient and payment received")}
                      style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "#16a34a", color: "#fff", border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      Mark Delivered
                    </button>
                  )}

                  {!["delivered", "cancelled"].includes(order.status) && (
                    <button
                      onClick={() => onUpdateStatus(order._id, "cancelled", "Cancelled by pharmacy operator")}
                      style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prescription Preview Modal */}
      {rxPreviewModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "1rem"
          }}
        >
          <div style={{ background: "var(--card-bg, #1e293b)", border: "1px solid var(--border-color, #334155)", borderRadius: "16px", padding: "1.75rem", maxWidth: "480px", width: "100%", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 1rem", color: "var(--text-primary, #f8fafc)" }}>Attached Patient Prescription</h3>
            <div style={{ padding: "2rem", background: "#0f172a", borderRadius: "10px", marginBottom: "1.5rem", border: "1px dashed #475569" }}>
              <FileText size={48} color="var(--teal-400, #2dd4bf)" style={{ margin: "0 auto 0.5rem" }} />
              <div style={{ color: "#fff", fontWeight: 600 }}>Rx-Document-Verified.pdf</div>
              <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                Prescription for antibiotics & anti-asthmatic medicines
              </div>
            </div>
            <button
              onClick={() => setRxPreviewModal(null)}
              style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", background: "var(--teal-600, #0d9488)", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
            >
              Close Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
