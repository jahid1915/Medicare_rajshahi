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
        return { bg: "rgba(194, 94, 0, 0.1)", color: "#c25e00", border: "1px solid rgba(194, 94, 0, 0.25)", label: "Pending Confirmation" };
      case "confirmed":
        return { bg: "rgba(13, 124, 110, 0.1)", color: "#0d7c6e", border: "1px solid rgba(13, 124, 110, 0.25)", label: "Order Confirmed" };
      case "preparing":
        return { bg: "rgba(124, 58, 237, 0.1)", color: "#7c3aed", border: "1px solid rgba(124, 58, 237, 0.25)", label: "Packing Medicines" };
      case "out_for_delivery":
        return { bg: "rgba(234, 88, 12, 0.1)", color: "#ea580c", border: "1px solid rgba(234, 88, 12, 0.25)", label: "Out for Delivery" };
      case "delivered":
        return { bg: "rgba(15, 138, 60, 0.1)", color: "#0f8a3c", border: "1px solid rgba(15, 138, 60, 0.25)", label: "Delivered & Paid" };
      case "cancelled":
        return { bg: "rgba(201, 28, 28, 0.1)", color: "#c91c1c", border: "1px solid rgba(201, 28, 28, 0.25)", label: "Cancelled" };
      default:
        return { bg: "var(--color-surface-2, #f0f5f4)", color: "var(--color-text-secondary, #2f4847)", border: "1px solid var(--color-border, #e2eceb)", label: status };
    }
  };

  return (
    <div>
      {/* Status Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
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
              padding: "0.55rem 1.15rem",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: selectedStatus === tab.id ? 700 : 500,
              cursor: "pointer",
              border:
                selectedStatus === tab.id
                  ? "1.5px solid var(--color-primary, #0d7c6e)"
                  : "1px solid var(--color-border, #e2eceb)",
              background:
                selectedStatus === tab.id
                  ? "var(--color-primary-light, #eaf6f4)"
                  : "#ffffff",
              color:
                selectedStatus === tab.id
                  ? "var(--color-primary-dark, #09594f)"
                  : "var(--color-text-secondary, #2f4847)",
              transition: "all 0.15s ease"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#ffffff", borderRadius: "16px", border: "1px solid var(--color-border, #e2eceb)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <Package size={40} style={{ color: "var(--color-text-muted, #47615f)", margin: "0 auto 1rem" }} />
          <h3 style={{ margin: "0 0 0.5rem", color: "var(--color-text, #142422)", fontSize: "1.2rem", fontWeight: 700 }}>No orders found</h3>
          <p style={{ margin: 0, color: "var(--color-text-secondary, #2f4847)", fontSize: "0.9rem" }}>Orders received from patients will appear here in real-time.</p>
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
                  background: "#ffffff",
                  border: "1px solid var(--color-border, #e2eceb)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                }}
              >
                {/* Top header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem", borderBottom: "1px solid var(--color-border, #e2eceb)", paddingBottom: "0.85rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--color-text, #142422)" }}>
                        {order.order_number || "ORD-RX-DEFAULT"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.65rem",
                          borderRadius: "6px",
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          border: statusInfo.border
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #47615f)", marginTop: "0.2rem", display: "inline-block" }}>
                      Placed {new Date(order.createdAt || Date.now()).toLocaleString("en-BD")}
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-primary, #0d7c6e)" }}>
                      ৳{order.total_amount}
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "var(--color-text-secondary, #2f4847)", textTransform: "capitalize", fontWeight: 500 }}>
                      {order.payment_method?.replace(/_/g, " ")} ({order.payment_status || "pending"})
                    </span>
                  </div>
                </div>

                {/* Recipient info & Prescription badge */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1rem", fontSize: "0.88rem" }}>
                  <div style={{ background: "var(--color-surface-2, #f8fafb)", border: "1px solid var(--color-border, #e2eceb)", padding: "0.85rem 1.1rem", borderRadius: "10px" }}>
                    <div style={{ fontWeight: 800, color: "var(--color-text, #142422)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                      <User size={14} color="var(--color-primary, #0d7c6e)" /> {addr.recipient_name || "Patient"}
                    </div>
                    <div style={{ color: "var(--color-text-secondary, #2f4847)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                      <Phone size={14} color="var(--color-primary, #0d7c6e)" /> {addr.phone || "017XXXXXXXX"}
                    </div>
                    <div style={{ color: "var(--color-text-secondary, #2f4847)", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: "2px", color: "var(--color-primary, #0d7c6e)" }} /> {addr.street}, {addr.area || "Rajshahi"}
                    </div>
                  </div>

                  {/* Prescription verification status */}
                  {order.prescription_required && (
                    <div style={{ background: "var(--color-surface-2, #f8fafb)", border: "1px solid var(--color-border, #e2eceb)", padding: "0.85rem 1.1rem", borderRadius: "10px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: order.prescription_verified ? "#0f8a3c" : "#c25e00", fontWeight: 700 }}>
                        {order.prescription_verified ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                        {order.prescription_verified ? "Prescription Verified by Pharmacist" : "Prescription Pending Verification"}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                        <button
                          onClick={() => setRxPreviewModal(order.prescription_image || "Uploaded Prescription Document")}
                          style={{
                            padding: "0.4rem 0.85rem",
                            borderRadius: "6px",
                            background: "#ffffff",
                            color: "var(--color-text, #142422)",
                            border: "1px solid var(--color-border, #e2eceb)",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          View Rx Document
                        </button>
                        {!order.prescription_verified && (
                          <button
                            onClick={() => onVerifyRx(order._id)}
                            style={{
                              padding: "0.4rem 0.85rem",
                              borderRadius: "6px",
                              background: "#0f8a3c",
                              color: "#fff",
                              border: "none",
                              fontSize: "0.82rem",
                              fontWeight: 700,
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
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-secondary, #2f4847)", marginBottom: "0.4rem" }}>
                    Items Ordered:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--color-text-secondary, #2f4847)" }}>
                        <span>
                          {item.brand_name} ({item.strength}) × {item.quantity}
                        </span>
                        <span style={{ color: "var(--color-text, #142422)", fontWeight: 700 }}>
                          ৳{item.total_price || item.unit_price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status action workflow buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap", borderTop: "1px solid var(--color-border, #e2eceb)", paddingTop: "1rem" }}>
                  {order.status === "pending" && (
                    <button
                      onClick={() => onUpdateStatus(order._id, "confirmed", "Pharmacy accepted the order")}
                      style={{ padding: "0.55rem 1.25rem", borderRadius: "8px", background: "var(--color-primary, #0d7c6e)", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 2px 6px rgba(13, 124, 110, 0.2)" }}
                    >
                      Confirm Order
                    </button>
                  )}

                  {order.status === "confirmed" && (
                    <button
                      onClick={() => onUpdateStatus(order._id, "preparing", "Pharmacist packing medicines and checking seals")}
                      style={{ padding: "0.55rem 1.25rem", borderRadius: "8px", background: "#7c3aed", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
                    >
                      Pack Medicines
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button
                      onClick={() => onUpdateStatus(order._id, "out_for_delivery", "Handed to courier rider for delivery")}
                      style={{ padding: "0.55rem 1.25rem", borderRadius: "8px", background: "#ea580c", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
                    >
                      Dispatch with Rider
                    </button>
                  )}

                  {order.status === "out_for_delivery" && (
                    <button
                      onClick={() => onUpdateStatus(order._id, "delivered", "Delivered to patient and payment received")}
                      style={{ padding: "0.55rem 1.25rem", borderRadius: "8px", background: "#0f8a3c", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
                    >
                      Mark Delivered
                    </button>
                  )}

                  {!["delivered", "cancelled"].includes(order.status) && (
                    <button
                      onClick={() => onUpdateStatus(order._id, "cancelled", "Cancelled by pharmacy operator")}
                      style={{ padding: "0.55rem 1rem", borderRadius: "8px", background: "transparent", border: "1.5px solid #c91c1c", color: "#c91c1c", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
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
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "1rem"
          }}
        >
          <div style={{ background: "#ffffff", border: "1px solid var(--color-border, #e2eceb)", borderRadius: "16px", padding: "1.75rem", maxWidth: "480px", width: "100%", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 1rem", color: "var(--color-text, #142422)", fontSize: "1.25rem", fontWeight: 800 }}>Attached Patient Prescription</h3>
            <div style={{ padding: "2rem", background: "var(--color-surface-2, #f8fafb)", borderRadius: "12px", marginBottom: "1.5rem", border: "1.5px dashed var(--color-border, #e2eceb)" }}>
              <FileText size={48} color="var(--color-primary, #0d7c6e)" style={{ margin: "0 auto 0.5rem" }} />
              <div style={{ color: "var(--color-text, #142422)", fontWeight: 700 }}>Rx-Document-Verified.pdf</div>
              <div style={{ color: "var(--color-text-secondary, #2f4847)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Prescription for antibiotics & anti-asthmatic medicines
              </div>
            </div>
            <button
              onClick={() => setRxPreviewModal(null)}
              style={{ padding: "0.65rem 1.5rem", borderRadius: "10px", background: "var(--color-primary, #0d7c6e)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
            >
              Close Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
