import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Search,
  MapPin,
  Phone,
  Clock,
  Truck,
  CheckCircle2,
  Star,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { pharmaciesAPI } from "../../services/api";

const RAJSHAHI_AREAS = [
  "All Areas",
  "Laxmipur",
  "Kazihata",
  "Shaheb Bazar",
  "Medical Road",
  "Talaimari",
  "Court Station"
];

// Fallback pharmacies if backend server is still starting or offline
const FALLBACK_PHARMACIES = [
  {
    _id: "pharm-laxmipur",
    name: "Niramoy Model Pharmacy - Laxmipur",
    area: "Laxmipur",
    address: "Holding 142, Medical College Main Gate Road, Laxmipur, Rajshahi",
    phone: "+880 1711-445566",
    rating: 4.9,
    review_count: 142,
    is_verified: true,
    is_24_7: true,
    delivery_available: true,
    delivery_eta_mins: 20,
    delivery_fee: 30,
    free_delivery_above: 400,
    opening_hours: { open: "12:00 AM", close: "11:59 PM" },
    featured_notice: "24/7 Emergency & ICU Medicine Dispensing Center near RMCH"
  },
  {
    _id: "pharm-shaheb",
    name: "Lazz Pharma - Shaheb Bazar",
    area: "Shaheb Bazar",
    address: "Zero Point Road, Shaheb Bazar, Rajshahi",
    phone: "+880 1819-334455",
    rating: 4.8,
    review_count: 215,
    is_verified: true,
    is_24_7: false,
    delivery_available: true,
    delivery_eta_mins: 30,
    delivery_fee: 35,
    free_delivery_above: 500,
    opening_hours: { open: "08:00 AM", close: "11:30 PM" },
    featured_notice: "Genuine imported insulin and oncology medications available"
  },
  {
    _id: "pharm-kazihata",
    name: "Padma Care Pharmacy - Kazihata",
    area: "Kazihata",
    address: "Kazihata More, Near Rajshahi City Hospital, Rajshahi",
    phone: "+880 1722-667788",
    rating: 4.7,
    review_count: 88,
    is_verified: true,
    is_24_7: true,
    delivery_available: true,
    delivery_eta_mins: 25,
    delivery_fee: 30,
    free_delivery_above: 450,
    opening_hours: { open: "12:00 AM", close: "11:59 PM" },
    featured_notice: "Temperature-controlled vaccine storage with unbroken cold chain"
  },
  {
    _id: "pharm-medical",
    name: "Al-Shefa Drug House - Medical Road",
    area: "Medical Road",
    address: "Hospital Gate 2, Medical Road, Rajshahi",
    phone: "+880 1912-998877",
    rating: 4.6,
    review_count: 94,
    is_verified: true,
    is_24_7: true,
    delivery_available: true,
    delivery_eta_mins: 15,
    delivery_fee: 25,
    free_delivery_above: 350,
    opening_hours: { open: "12:00 AM", close: "11:59 PM" },
    featured_notice: "Immediate hospital corridor delivery available 24 hours"
  },
  {
    _id: "pharm-talaimari",
    name: "Barendra Health Pharmacy - Talaimari",
    area: "Talaimari",
    address: "RUET Bypass Road, Talaimari, Rajshahi",
    phone: "+880 1733-112244",
    rating: 4.8,
    review_count: 73,
    is_verified: true,
    is_24_7: false,
    delivery_available: true,
    delivery_eta_mins: 35,
    delivery_fee: 40,
    free_delivery_above: 500,
    opening_hours: { open: "08:30 AM", close: "11:00 PM" },
    featured_notice: "University campus express medicine drop-off service"
  },
  {
    _id: "pharm-court",
    name: "Green Life Pharmacy - Court Station",
    area: "Court Station",
    address: "Station Road, Court Chottor, Rajshahi",
    phone: "+880 1744-889900",
    rating: 4.5,
    review_count: 51,
    is_verified: true,
    is_24_7: false,
    delivery_available: true,
    delivery_eta_mins: 40,
    delivery_fee: 40,
    free_delivery_above: 600,
    opening_hours: { open: "09:00 AM", close: "10:30 PM" },
    featured_notice: "Special discounts for senior citizens and chronic care patients"
  }
];

export default function PharmacyDirectory() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [filter247, setFilter247] = useState(false);
  const [filterDelivery, setFilterDelivery] = useState(false);

  useEffect(() => {
    fetchPharmacies();
  }, [selectedArea, filter247, filterDelivery]);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const params = { city: "Rajshahi" };
      if (selectedArea !== "All Areas") params.area = selectedArea;
      if (filter247) params.is_24_7 = "true";
      if (filterDelivery) params.delivery_available = "true";
      if (search) params.search = search;

      const res = await pharmaciesAPI.getAll(params);
      if (res.data && res.data.length > 0) {
        setPharmacies(res.data);
      } else {
        // Fallback filter
        let filtered = [...FALLBACK_PHARMACIES];
        if (selectedArea !== "All Areas") {
          filtered = filtered.filter((p) => p.area === selectedArea);
        }
        if (filter247) {
          filtered = filtered.filter((p) => p.is_24_7);
        }
        if (filterDelivery) {
          filtered = filtered.filter((p) => p.delivery_available);
        }
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(s) ||
              p.area.toLowerCase().includes(s) ||
              p.address.toLowerCase().includes(s)
          );
        }
        setPharmacies(filtered);
      }
    } catch {
      // Offline fallback
      let filtered = [...FALLBACK_PHARMACIES];
      if (selectedArea !== "All Areas") {
        filtered = filtered.filter((p) => p.area === selectedArea);
      }
      if (filter247) {
        filtered = filtered.filter((p) => p.is_24_7);
      }
      if (filterDelivery) {
        filtered = filtered.filter((p) => p.delivery_available);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.area.toLowerCase().includes(s) ||
            p.address.toLowerCase().includes(s)
        );
      }
      setPharmacies(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPharmacies();
  };

  return (
    <div className="pharmacy-directory-page" style={{ padding: "2rem 1.5rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)",
          border: "1px solid rgba(13, 148, 136, 0.25)",
          borderRadius: "16px",
          padding: "2rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(13, 148, 136, 0.2)", padding: "0.25rem 0.75rem", borderRadius: "999px", color: "var(--teal-400, #2dd4bf)", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              <Sparkles size={14} /> Rajshahi Verified Pharmacy Network
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: "var(--text-primary, #f8fafc)" }}>
              Rajshahi Pharmacy Ecosystem
            </h1>
            <p style={{ color: "var(--text-secondary, #94a3b8)", margin: 0, maxWidth: "650px", lineHeight: 1.5 }}>
              Connect with verified community pharmacies, 24/7 emergency drug stores, and ICU dispensing units across Rajshahi City. Compare medicine prices and get doorstep delivery.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <Link
              to="/medicines"
              className="btn btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.25rem",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "var(--text-primary, #fff)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}
            >
              <Search size={16} /> Search Medicines
            </Link>
            <Link
              to="/pharmacy-portal"
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.25rem",
                borderRadius: "10px",
                background: "var(--teal-500, #0d9488)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}
            >
              <Store size={16} /> Pharmacy Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          background: "var(--card-bg, #1e293b)",
          border: "1px solid var(--border-color, #334155)",
          borderRadius: "14px",
          padding: "1.25rem",
          marginBottom: "1.75rem"
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <div style={{ flex: "1 1 320px", position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted, #64748b)"
              }}
            />
            <input
              type="text"
              placeholder="Search pharmacy by name, location (e.g. Laxmipur, Medical Road)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                borderRadius: "10px",
                border: "1px solid var(--border-color, #334155)",
                background: "var(--input-bg, #0f172a)",
                color: "var(--text-primary, #f8fafc)",
                fontSize: "0.95rem"
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              background: "var(--teal-500, #0d9488)",
              border: "none",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          {/* Area Chips */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {RAJSHAHI_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  border:
                    selectedArea === area
                      ? "1px solid var(--teal-500, #0d9488)"
                      : "1px solid var(--border-color, #334155)",
                  background:
                    selectedArea === area
                      ? "rgba(13, 148, 136, 0.2)"
                      : "transparent",
                  color:
                    selectedArea === area
                      ? "var(--teal-400, #2dd4bf)"
                      : "var(--text-secondary, #94a3b8)"
                }}
              >
                {area}
              </button>
            ))}
          </div>

          {/* Quick Toggles */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.88rem", color: "var(--text-secondary, #94a3b8)" }}>
              <input
                type="checkbox"
                checked={filter247}
                onChange={(e) => setFilter247(e.target.checked)}
              />
              24/7 Open
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.88rem", color: "var(--text-secondary, #94a3b8)" }}>
              <input
                type="checkbox"
                checked={filterDelivery}
                onChange={(e) => setFilterDelivery(e.target.checked)}
              />
              Home Delivery
            </label>
          </div>
        </div>
      </div>

      {/* Pharmacy Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-secondary, #94a3b8)" }}>Loading Rajshahi pharmacies...</p>
        </div>
      ) : pharmacies.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--card-bg, #1e293b)", borderRadius: "14px" }}>
          <AlertCircle size={40} style={{ color: "var(--text-muted, #64748b)", margin: "0 auto 1rem" }} />
          <h3 style={{ color: "var(--text-primary, #f8fafc)", margin: "0 0 0.5rem" }}>No pharmacies found</h3>
          <p style={{ color: "var(--text-secondary, #94a3b8)", margin: 0 }}>Try clearing search or choosing another Rajshahi area.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "1.5rem"
          }}
        >
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy._id || pharmacy.id}
              style={{
                background: "var(--card-bg, #1e293b)",
                border: "1px solid var(--border-color, #334155)",
                borderRadius: "14px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "transform 0.2s ease, border-color 0.2s ease"
              }}
            >
              <div>
                {/* Badges row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "6px",
                        background: "rgba(13, 148, 136, 0.2)",
                        color: "var(--teal-400, #2dd4bf)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem"
                      }}
                    >
                      <MapPin size={12} /> {pharmacy.area}
                    </span>

                    {pharmacy.is_24_7 && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "6px",
                          background: "rgba(239, 68, 68, 0.2)",
                          color: "#f87171"
                        }}
                      >
                        ⚡ 24/7 Open
                      </span>
                    )}

                    {pharmacy.delivery_available && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "6px",
                          background: "rgba(14, 165, 233, 0.2)",
                          color: "#38bdf8",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}
                      >
                        <Truck size={12} /> ~{pharmacy.delivery_eta_mins || 30}m
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#fbbf24", fontWeight: 700, fontSize: "0.9rem" }}>
                    <Star size={15} fill="#fbbf24" /> {pharmacy.rating || 4.8}
                  </div>
                </div>

                {/* Pharmacy Name */}
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "var(--text-primary, #f8fafc)" }}>
                  {pharmacy.name}
                </h3>

                {/* Address */}
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary, #94a3b8)", margin: "0 0 0.75rem 0", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: "2px", color: "var(--text-muted, #64748b)" }} />
                  {pharmacy.address}
                </p>

                {/* Operating hours & phone */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.82rem", color: "var(--text-muted, #94a3b8)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Clock size={14} />
                    {pharmacy.is_24_7 ? "Always Open" : `${pharmacy.opening_hours?.open || "08:00 AM"} - ${pharmacy.opening_hours?.close || "11:00 PM"}`}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Phone size={14} />
                    <a href={`tel:${pharmacy.phone}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {pharmacy.phone}
                    </a>
                  </div>
                </div>

                {/* Notice */}
                {pharmacy.featured_notice && (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      borderLeft: "3px solid var(--teal-500, #0d9488)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0 6px 6px 0",
                      fontSize: "0.8rem",
                      color: "var(--text-secondary, #94a3b8)",
                      marginBottom: "1rem"
                    }}
                  >
                    {pharmacy.featured_notice}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color, #334155)" }}>
                <Link
                  to={`/pharmacies/${pharmacy._id || pharmacy.id}`}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    padding: "0.65rem 1rem",
                    borderRadius: "8px",
                    background: "var(--teal-600, #0d9488)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.88rem"
                  }}
                >
                  <Store size={15} /> Browse Medicines <ChevronRight size={14} />
                </Link>

                <a
                  href={`tel:${pharmacy.phone}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.65rem 0.9rem",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid var(--border-color, #334155)",
                    color: "var(--text-primary, #f8fafc)",
                    textDecoration: "none"
                  }}
                  title="Call Pharmacy"
                >
                  <Phone size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
