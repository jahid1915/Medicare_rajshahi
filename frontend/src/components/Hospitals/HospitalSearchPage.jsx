import React, { useState, useMemo } from "react";
import { RAJSHAHI_HOSPITALS, RAJSHAHI_AREAS } from "../../data/rajshahiHospitals";
import { Search, Filter, MapPin, Phone, ShieldCheck, ChevronRight, Building2, Ambulance, AlertTriangle } from "lucide-react";

const TYPE_OPTIONS = ["All Types", "government", "private"];

function HospitalCard({ hospital, onView }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1.5px solid var(--border-default)",
      borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px",
      transition: "border-color 0.2s, box-shadow 0.2s",
      cursor: "pointer"
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.boxShadow = "none"; }}
    onClick={() => onView(hospital.id)}
    >
      {/* Top Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span style={{
              padding: "2px 8px", borderRadius: "999px", fontSize: "0.68rem", fontWeight: 700,
              background: hospital.type === "government" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)",
              color: hospital.type === "government" ? "#3b82f6" : "#a855f7",
              border: `1px solid ${hospital.type === "government" ? "rgba(59,130,246,0.3)" : "rgba(168,85,247,0.3)"}`
            }}>
              {hospital.type === "government" ? "Government" : "Private"}
            </span>
            {hospital.is_verified && (
              <span style={{
                display: "flex", alignItems: "center", gap: "3px",
                padding: "2px 8px", borderRadius: "999px", fontSize: "0.68rem", fontWeight: 700,
                background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)"
              }}>
                <ShieldCheck size={11} /> Verified
              </span>
            )}
          </div>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {hospital.name}
          </h3>
        </div>
        <ChevronRight size={18} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: "4px" }} />
      </div>

      {/* Location & Contact */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <MapPin size={12} />
          {hospital.address || `${hospital.area}, Rajshahi`}
        </span>
        {hospital.phone ? (
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            <Phone size={12} /> {hospital.phone}
          </span>
        ) : (
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", opacity: 0.6 }}>Phone not listed</span>
        )}
      </div>

      {/* Capability Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
        {[
          { key: "has_icu",       label: "ICU",        color: "#f59e0b" },
          { key: "has_ccu",       label: "CCU",        color: "#f59e0b" },
          { key: "has_nicu",      label: "NICU",       color: "#f59e0b" },
          { key: "has_emergency", label: "Emergency",  color: "#ef4444" },
          { key: "has_blood_bank",label: "Blood Bank", color: "#f43f5e" },
          { key: "has_ambulance", label: "Ambulance",  color: "#3b82f6" },
          { key: "has_diagnostic",label: "Diagnostic", color: "#8b5cf6" }
        ].filter(f => hospital[f.key]).map(f => (
          <span key={f.key} style={{
            padding: "2px 7px", borderRadius: "5px", fontSize: "0.65rem", fontWeight: 700,
            background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}40`
          }}>{f.label}</span>
        ))}
      </div>

      {/* Bed Count */}
      {hospital.bed_count_approx && (
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          ~<strong style={{ color: "var(--text-secondary)" }}>{hospital.bed_count_approx.toLocaleString()}</strong> beds (approx.)
        </div>
      )}

      {/* View Resources Button */}
      <button
        onClick={e => { e.stopPropagation(); onView(hospital.id); }}
        style={{
          padding: "8px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700,
          background: "var(--primary)", color: "white", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transition: "opacity 0.15s"
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        <Building2 size={14} /> View Resources
      </button>
    </div>
  );
}

export default function HospitalSearchPage({ onViewHospital }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedType, setSelectedType] = useState("All Types");
  const [filterICU, setFilterICU] = useState(false);
  const [filterEmergency, setFilterEmergency] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);

  const filtered = useMemo(() => {
    return RAJSHAHI_HOSPITALS.filter(h => {
      if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !h.area.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedArea !== "All Areas" && h.area !== selectedArea) return false;
      if (selectedType !== "All Types" && h.type !== selectedType) return false;
      if (filterICU && !h.has_icu) return false;
      if (filterEmergency && !h.has_emergency) return false;
      if (filterVerified && !h.is_verified) return false;
      return true;
    });
  }, [searchQuery, selectedArea, selectedType, filterICU, filterEmergency, filterVerified]);

  const govCount = RAJSHAHI_HOSPITALS.filter(h => h.type === "government").length;
  const privateCount = RAJSHAHI_HOSPITALS.filter(h => h.type === "private").length;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "6px" }}>
          Hospitals in Rajshahi
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Find hospitals, check resource availability, and get contact information.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Listed",  value: RAJSHAHI_HOSPITALS.length, color: "var(--primary)" },
          { label: "Government",    value: govCount,     color: "#3b82f6" },
          { label: "Private",       value: privateCount, color: "#a855f7" },
          { label: "Verified",      value: RAJSHAHI_HOSPITALS.filter(h => h.is_verified).length, color: "#22c55e" },
          { label: "With ICU",      value: RAJSHAHI_HOSPITALS.filter(h => h.has_icu).length, color: "#f59e0b" },
          { label: "Emergency 24/7",value: RAJSHAHI_HOSPITALS.filter(h => h.has_emergency).length, color: "#ef4444" }
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--bg-card)", border: "1.5px solid var(--border-default)",
            borderRadius: "10px", padding: "14px 12px"
          }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, marginTop: "3px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{
        background: "var(--bg-card)", border: "1.5px solid var(--border-default)",
        borderRadius: "14px", padding: "16px 20px", marginBottom: "20px",
        display: "flex", flexDirection: "column", gap: "12px"
      }}>
        {/* Search Bar */}
        <div style={{ position: "relative" }}>
          <Search size={16} style={{
            position: "absolute", left: "12px", top: "50%",
            transform: "translateY(-50%)", color: "var(--text-muted)"
          }} />
          <input
            type="text"
            placeholder="Search hospitals by name or area..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px 10px 38px", borderRadius: "10px",
              fontSize: "0.85rem", fontWeight: 500,
              background: "var(--bg-badge)", color: "var(--text-primary)",
              border: "1.5px solid var(--border-default)", outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Filters Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)} style={{
            padding: "7px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600,
            background: "var(--bg-badge)", color: "var(--text-secondary)",
            border: "1.5px solid var(--border-default)", cursor: "pointer"
          }}>
            {RAJSHAHI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{
            padding: "7px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600,
            background: "var(--bg-badge)", color: "var(--text-secondary)",
            border: "1.5px solid var(--border-default)", cursor: "pointer"
          }}>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t === "All Types" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>

          {/* Toggle Filters */}
          {[
            { label: "ICU",       state: filterICU,      set: setFilterICU },
            { label: "Emergency", state: filterEmergency,set: setFilterEmergency },
            { label: "Verified",  state: filterVerified, set: setFilterVerified }
          ].map(f => (
            <button key={f.label}
              onClick={() => f.set(!f.state)}
              style={{
                padding: "7px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700,
                cursor: "pointer", transition: "all 0.15s",
                background: f.state ? "var(--primary)" : "var(--bg-badge)",
                color: f.state ? "white" : "var(--text-secondary)",
                border: f.state ? "1.5px solid var(--primary)" : "1.5px solid var(--border-default)"
              }}
            >
              {f.label}
            </button>
          ))}

          <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Data Coverage Notice */}
      <div style={{
        background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: "10px", padding: "10px 16px", marginBottom: "20px",
        fontSize: "0.77rem", color: "#60a5fa", display: "flex", gap: "8px", alignItems: "center"
      }}>
        <AlertTriangle size={14} style={{ flexShrink: 0 }} />
        <span>
          Niramoy is currently in early access for Rajshahi. Real-time resource data requires hospital admin cooperation.
          Contact information may be incomplete — help us improve by reporting corrections.
        </span>
      </div>

      {/* Hospital Grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          background: "var(--bg-card)", borderRadius: "14px",
          border: "1.5px solid var(--border-default)", color: "var(--text-muted)"
        }}>
          <Building2 size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
          <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>No hospitals match your filters</p>
          <button onClick={() => { setSearchQuery(""); setSelectedArea("All Areas"); setSelectedType("All Types"); setFilterICU(false); setFilterEmergency(false); setFilterVerified(false); }}
            style={{
              marginTop: "12px", padding: "8px 20px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700,
              background: "var(--primary)", color: "white", border: "none", cursor: "pointer"
            }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {filtered.map(h => (
            <HospitalCard key={h.id} hospital={h} onView={onViewHospital} />
          ))}
        </div>
      )}
    </div>
  );
}
