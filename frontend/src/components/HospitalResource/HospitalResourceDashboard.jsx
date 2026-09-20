import React, { useState, useEffect } from "react";
import ResourceCard from "./ResourceCard";
import ResourceStatusBadge from "./ResourceStatusBadge";
import { RAJSHAHI_HOSPITALS, MOCK_RESOURCES, RESOURCE_TYPE_CONFIG } from "../../data/rajshahiHospitals";
import { ArrowLeft, Phone, MapPin, Shield, ShieldCheck, RefreshCw, AlertTriangle, Building2 } from "lucide-react";

const CATEGORIES = ["All", "Beds", "Cabins", "Critical Care", "Emergency", "OT", "Other"];

export default function HospitalResourceDashboard({ hospitalId, onBack }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hospital, setHospital] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate API fetch — replace with real API call when backend is ready
    // GET /api/hospitals/:id and GET /api/hospitals/:id/resources
    setTimeout(() => {
      const h = RAJSHAHI_HOSPITALS.find(h => h.id === hospitalId) || RAJSHAHI_HOSPITALS[0];
      const r = MOCK_RESOURCES[h.id] || [];
      setHospital(h);
      setResources(r);
      setLoading(false);
    }, 400);
  }, [hospitalId]);

  if (loading || !hospital) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading hospital data...</div>
      </div>
    );
  }

  const filteredResources = activeCategory === "All"
    ? resources
    : resources.filter(r => {
        const cfg = RESOURCE_TYPE_CONFIG[r.resource_type];
        return cfg && cfg.category === activeCategory;
      });

  const totalBeds = hospital.bed_count_approx;
  const knownResources = resources.filter(r => r.available_count != null);
  const totalAvailable = knownResources.reduce((s, r) => s + (r.available_count || 0), 0);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>

      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "none", border: "none", color: "var(--text-muted)",
          cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, marginBottom: "20px",
          padding: "6px 10px", borderRadius: "8px",
          transition: "background 0.15s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-badge)"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >
        <ArrowLeft size={16} /> Back to Hospitals
      </button>

      {/* Hospital Header Card */}
      <div style={{
        background: "var(--bg-card)", border: "1.5px solid var(--border-default)",
        borderRadius: "16px", padding: "24px", marginBottom: "24px"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
              <span style={{
                padding: "3px 10px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                background: hospital.type === "government" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)",
                color: hospital.type === "government" ? "#3b82f6" : "#a855f7",
                border: `1px solid ${hospital.type === "government" ? "rgba(59,130,246,0.3)" : "rgba(168,85,247,0.3)"}`
              }}>
                {hospital.type === "government" ? "🏛 Government" : "🏥 Private"}
              </span>
              {hospital.is_verified && (
                <span style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "3px 10px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                  background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)"
                }}>
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "6px" }}>
              {hospital.name}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {hospital.address && (
                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <MapPin size={13} /> {hospital.address}
                </span>
              )}
              {hospital.phone && (
                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <Phone size={13} /> {hospital.phone}
                </span>
              )}
              {hospital.emergency_phone && (
                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#ef4444", fontWeight: 700 }}>
                  <Phone size={13} /> Emergency: {hospital.emergency_phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Service Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "16px" }}>
          {hospital.services.map(s => (
            <span key={s} style={{
              padding: "2px 8px", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 600,
              background: "var(--bg-badge)", color: "var(--text-secondary)",
              border: "1px solid var(--border-default)"
            }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Resource Overview Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Beds", value: totalBeds != null ? totalBeds.toLocaleString() : "Unknown", sub: "Approx. capacity", color: "var(--primary)" },
          { label: "Available (Known)", value: knownResources.length > 0 ? totalAvailable : "—", sub: "Across tracked resources", color: "#22c55e" },
          { label: "ICU", value: hospital.has_icu ? "Present" : "None", sub: hospital.has_icu ? "Facility available" : "Not available", color: hospital.has_icu ? "#f59e0b" : "#6b7280" },
          { label: "CCU", value: hospital.has_ccu ? "Present" : "None", sub: hospital.has_ccu ? "Facility available" : "Not available", color: hospital.has_ccu ? "#f59e0b" : "#6b7280" },
          { label: "Emergency", value: hospital.has_emergency ? "24/7" : "None", sub: hospital.has_emergency ? "Emergency services" : "Not available", color: hospital.has_emergency ? "#ef4444" : "#6b7280" },
          { label: "Blood Bank", value: hospital.has_blood_bank ? "Yes" : "None", sub: hospital.has_blood_bank ? "Available" : "Not reported", color: hospital.has_blood_bank ? "#f43f5e" : "#6b7280" }
        ].map(card => (
          <div key={card.label} style={{
            background: "var(--bg-card)", border: "1.5px solid var(--border-default)",
            borderRadius: "12px", padding: "16px 14px"
          }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: card.color, letterSpacing: "-0.02em" }}>
              {card.value}
            </div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--text-secondary)", marginTop: "3px" }}>
              {card.label}
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Data Quality Notice */}
      <div style={{
        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: "10px", padding: "12px 16px", marginBottom: "24px",
        display: "flex", alignItems: "flex-start", gap: "10px"
      }}>
        <AlertTriangle size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: "1px" }} />
        <div style={{ fontSize: "0.78rem", color: "#d97706", lineHeight: 1.5 }}>
          <strong>Data Notice:</strong> Hospital resource availability data is not yet connected to a real-time feed.
          Figures shown reflect approximate or manually reported data. Always confirm with the hospital directly before visiting.
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {CATEGORIES.map(cat => (
          <button key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "6px 16px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 700,
              cursor: "pointer", transition: "all 0.15s",
              background: activeCategory === cat ? "var(--primary)" : "var(--bg-badge)",
              color: activeCategory === cat ? "white" : "var(--text-secondary)",
              border: activeCategory === cat ? "1.5px solid var(--primary)" : "1.5px solid var(--border-default)"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          background: "var(--bg-card)", borderRadius: "14px",
          border: "1.5px solid var(--border-default)", color: "var(--text-muted)"
        }}>
          <Building2 size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
          <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>No resources listed in this category</p>
          <p style={{ fontSize: "0.78rem", marginTop: "6px" }}>The hospital admin has not yet reported data for this category.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px"
        }}>
          {filteredResources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onViewDetails={(r) => console.log("View details:", r)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
