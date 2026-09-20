import React from "react";

const STATUS_CONFIG = {
  available:   { label: "Available",    dotColor: "#22c55e", textColor: "#16a34a", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)" },
  limited:     { label: "Limited",      dotColor: "#f59e0b", textColor: "#d97706", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)" },
  full:        { label: "Full",         dotColor: "#ef4444", textColor: "#dc2626", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)" },
  unavailable: { label: "Unavailable",  dotColor: "#6b7280", textColor: "#4b5563", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.3)" },
  maintenance: { label: "Maintenance",  dotColor: "#8b5cf6", textColor: "#7c3aed", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.3)" },
  unknown:     { label: "Data Unknown", dotColor: "#9ca3af", textColor: "#6b7280", bg: "rgba(156,163,175,0.08)","border": "rgba(156,163,175,0.25)" }
};

export default function ResourceStatusBadge({ status = "unknown", size = "sm" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  const isLg = size === "lg";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: isLg ? "6px" : "4px",
      padding: isLg ? "4px 10px" : "2px 8px", borderRadius: "999px",
      fontSize: isLg ? "0.8rem" : "0.7rem", fontWeight: 700, letterSpacing: "0.02em",
      background: cfg.bg, color: cfg.textColor, border: `1px solid ${cfg.border}`, whiteSpace: "nowrap"
    }}>
      <span style={{ width: isLg ? "7px" : "6px", height: isLg ? "7px" : "6px", borderRadius: "50%", background: cfg.dotColor, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}
