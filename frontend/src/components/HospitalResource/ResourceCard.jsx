import React from "react";
import ResourceStatusBadge from "./ResourceStatusBadge";
import { RESOURCE_TYPE_CONFIG } from "../../data/rajshahiHospitals";
import { Clock, Info } from "lucide-react";

function formatLastUpdated(ts) {
  if (!ts) return null;
  const diff = (Date.now() - new Date(ts).getTime()) / 1000 / 60;
  if (diff < 60) return `${Math.floor(diff)} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function getStaleWarning(ts) {
  if (!ts) return null;
  const hours = (Date.now() - new Date(ts).getTime()) / 1000 / 3600;
  if (hours > 24) return { level: "critical", msg: "Data is 24+ hours old — not reliable" };
  if (hours > 6)  return { level: "warn",     msg: "Data may be outdated" };
  return null;
}

function calcOccupancy(available, total) {
  if (total == null || available == null) return null;
  return Math.round(((total - available) / total) * 100);
}

export default function ResourceCard({ resource, onViewDetails }) {
  const cfg = RESOURCE_TYPE_CONFIG[resource.resource_type] || { label: resource.resource_name, icon: "🏥", category: "Other" };
  const stale = getStaleWarning(resource.last_updated);
  const occupancy = calcOccupancy(resource.available_count, resource.total_capacity);
  const isUnknown = resource.status === "unknown" || resource.available_count == null;

  const occupancyColor =
    occupancy == null ? "#9ca3af" :
    occupancy >= 90   ? "#ef4444" :
    occupancy >= 70   ? "#f59e0b" : "#22c55e";

  return (
    <div style={{
      background: "var(--bg-card)", border: "1.5px solid var(--border-default)", borderRadius: "14px",
      padding: "18px", display: "flex", flexDirection: "column", gap: "12px",
      transition: "box-shadow 0.2s", cursor: "default"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{cfg.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)" }}>{cfg.label}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>{cfg.category}</div>
          </div>
        </div>
        <ResourceStatusBadge status={resource.status} size="sm" />
      </div>

      {/* Capacity Stats */}
      {isUnknown ? (
        <div style={{
          background: "rgba(156,163,175,0.07)", borderRadius: "8px", padding: "10px 12px",
          display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.78rem"
        }}>
          <Info size={14} />
          <span>Availability data not yet available from hospital</span>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
            {[
              { label: "Total", value: resource.total_capacity ?? "—", color: "var(--text-secondary)" },
              { label: "Available", value: resource.available_count ?? "—", color: "#22c55e" },
              { label: "Occupied", value: resource.occupied_count ?? "—", color: "#ef4444" }
            ].map(s => (
              <div key={s.label} style={{ background: "var(--bg-badge)", borderRadius: "8px", padding: "8px 4px" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Occupancy Bar */}
          {occupancy != null && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>Occupancy</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: occupancyColor }}>{occupancy}%</span>
              </div>
              <div style={{ height: "6px", borderRadius: "999px", background: "var(--border-default)" }}>
                <div style={{
                  height: "100%", borderRadius: "999px", width: `${occupancy}%`,
                  background: occupancyColor, transition: "width 0.5s ease"
                }} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Last Updated */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {resource.last_updated ? (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-muted)", fontSize: "0.68rem" }}>
            <Clock size={11} />
            <span>Updated {formatLastUpdated(resource.last_updated)}</span>
            {resource.source && <span style={{ opacity: 0.6 }}>· {resource.source}</span>}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-muted)", fontSize: "0.68rem" }}>
            <Clock size={11} />
            <span>Last update unknown</span>
          </div>
        )}

        {/* Stale Warning */}
        {stale && (
          <div style={{
            fontSize: "0.7rem", fontWeight: 600, padding: "4px 8px", borderRadius: "6px",
            background: stale.level === "critical" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
            color: stale.level === "critical" ? "#dc2626" : "#d97706",
            display: "flex", alignItems: "center", gap: "4px"
          }}>
            ⚠ {stale.msg}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onViewDetails && onViewDetails(resource)}
        style={{
          padding: "7px 14px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700,
          background: "var(--bg-badge)", color: "var(--text-secondary)",
          border: "1.5px solid var(--border-default)", cursor: "pointer", width: "100%",
          transition: "background 0.15s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--primary)"}
        onMouseLeave={e => e.currentTarget.style.background = "var(--bg-badge)"}
      >
        {resource.is_bookable ? "Book Now" : "View Details"}
      </button>
    </div>
  );
}
