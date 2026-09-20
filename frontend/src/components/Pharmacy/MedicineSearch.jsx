import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Building,
  Store,
  MapPin,
  Truck,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  AlertCircle,
  Sparkles,
  Info
} from "lucide-react";
import { medicinesAPI, pharmaciesAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";

const CATEGORIES = [
  "All",
  "Analgesic & Antipyretic",
  "Gastrointestinal",
  "Antibiotic",
  "Antihistamine",
  "Vitamin & Mineral",
  "Respiratory",
  "Cardiovascular",
  "Antidiabetic",
  "Emergency & Critical"
];

const DEFAULT_MEDICINES = [
  {
    _id: "med-1",
    brand_name: "Napa Extra",
    generic_name: "Paracetamol + Caffeine",
    category: "Analgesic & Antipyretic",
    manufacturer: "Beximco Pharmaceuticals Ltd.",
    dosage_form: "Tablet",
    strength: "500mg + 65mg",
    unit: "strip of 10",
    unit_price: 30,
    requires_prescription: false,
    indications: "Fever, headache, toothache, body ache and migraine pain."
  },
  {
    _id: "med-2",
    brand_name: "Seclo 20",
    generic_name: "Omeprazole",
    category: "Gastrointestinal",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Capsule",
    strength: "20mg",
    unit: "strip of 10",
    unit_price: 70,
    requires_prescription: false,
    indications: "Gastric ulcers, GERD, acid reflux and heartburn."
  },
  {
    _id: "med-3",
    brand_name: "Maxpro 20",
    generic_name: "Esomeprazole",
    category: "Gastrointestinal",
    manufacturer: "Incepta Pharmaceuticals Ltd.",
    dosage_form: "Tablet",
    strength: "20mg",
    unit: "strip of 10",
    unit_price: 80,
    requires_prescription: false,
    indications: "Erosive esophagitis, severe acid reflux and H. pylori."
  },
  {
    _id: "med-4",
    brand_name: "Fexo 120",
    generic_name: "Fexofenadine Hydrochloride",
    category: "Antihistamine",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Tablet",
    strength: "120mg",
    unit: "strip of 10",
    unit_price: 90,
    requires_prescription: false,
    indications: "Seasonal allergic rhinitis, sneezing, watery eyes and itching."
  },
  {
    _id: "med-5",
    brand_name: "Ceevit",
    generic_name: "Ascorbic Acid (Vitamin C)",
    category: "Vitamin & Mineral",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Tablet",
    strength: "250mg",
    unit: "strip of 10",
    unit_price: 25,
    requires_prescription: false,
    indications: "Immune system support, wound healing, collagen maintenance."
  },
  {
    _id: "med-6",
    brand_name: "Zithrin 500",
    generic_name: "Azithromycin",
    category: "Antibiotic",
    manufacturer: "Beximco Pharmaceuticals Ltd.",
    dosage_form: "Tablet",
    strength: "500mg",
    unit: "strip of 3",
    unit_price: 120,
    requires_prescription: true,
    indications: "Respiratory infections, sinusitis, tonsillitis (Rx Required)."
  },
  {
    _id: "med-7",
    brand_name: "Monas 10",
    generic_name: "Montelukast",
    category: "Respiratory",
    manufacturer: "The ACME Laboratories Ltd.",
    dosage_form: "Tablet",
    strength: "10mg",
    unit: "strip of 10",
    unit_price: 175,
    requires_prescription: true,
    indications: "Asthma management and chronic allergic rhinitis (Rx Required)."
  },
  {
    _id: "med-8",
    brand_name: "Combit 500",
    generic_name: "Metformin Hydrochloride",
    category: "Antidiabetic",
    manufacturer: "Square Pharmaceuticals PLC",
    dosage_form: "Tablet",
    strength: "500mg",
    unit: "strip of 10",
    unit_price: 45,
    requires_prescription: true,
    indications: "Type 2 diabetes glycemic control (Rx Required)."
  },
  {
    _id: "med-9",
    brand_name: "ORSaline-N",
    generic_name: "Oral Rehydration Salts",
    category: "Emergency & Critical",
    manufacturer: "Social Marketing Company (SMC)",
    dosage_form: "Sachet",
    strength: "WHO Standard",
    unit: "sachet",
    unit_price: 6,
    requires_prescription: false,
    indications: "Rapid rehydration during diarrhea, heat exhaustion, and vomiting."
  }
];

const DEFAULT_PHARMACIES_STOCK = [
  {
    pharmacy: {
      _id: "p1",
      name: "Niramoy Model Pharmacy - Laxmipur",
      area: "Laxmipur",
      delivery_fee: 30,
      delivery_eta_mins: 20,
      is_24_7: true,
      free_delivery_above: 400
    },
    in_stock: true,
    stock_quantity: 140,
    price_offset: 0
  },
  {
    pharmacy: {
      _id: "p2",
      name: "Lazz Pharma - Shaheb Bazar",
      area: "Shaheb Bazar",
      delivery_fee: 35,
      delivery_eta_mins: 30,
      is_24_7: false,
      free_delivery_above: 500
    },
    in_stock: true,
    stock_quantity: 210,
    price_offset: 0
  },
  {
    pharmacy: {
      _id: "p3",
      name: "Padma Care Pharmacy - Kazihata",
      area: "Kazihata",
      delivery_fee: 30,
      delivery_eta_mins: 25,
      is_24_7: true,
      free_delivery_above: 450
    },
    in_stock: true,
    stock_quantity: 85,
    price_offset: -2
  }
];

export default function MedicineSearch() {
  const { addToCart, totalItemsCount } = useCart();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedMedId, setExpandedMedId] = useState(null);
  const [addedItemMap, setAddedItemMap] = useState({});

  useEffect(() => {
    fetchMedicines();
  }, [selectedCategory]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (search) params.search = search;

      const res = await medicinesAPI.getAll(params);
      if (res.data && res.data.length > 0) {
        setMedicines(res.data);
      } else {
        useFallback();
      }
    } catch {
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
    let filtered = [...DEFAULT_MEDICINES];
    if (selectedCategory !== "All") {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.brand_name.toLowerCase().includes(s) ||
          m.generic_name.toLowerCase().includes(s) ||
          m.manufacturer.toLowerCase().includes(s) ||
          m.category.toLowerCase().includes(s)
      );
    }
    setMedicines(filtered);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMedicines();
  };

  const handleAddToCart = (medicine, pharmacyStock) => {
    const pharmacy = pharmacyStock.pharmacy;
    const finalPrice = Math.max(1, (medicine.unit_price || 30) + (pharmacyStock.price_offset || 0));
    
    addToCart(
      {
        _id: medicine._id,
        brand_name: medicine.brand_name,
        generic_name: medicine.generic_name,
        dosage_form: medicine.dosage_form,
        strength: medicine.strength,
        unit_price: finalPrice,
        requires_prescription: medicine.requires_prescription
      },
      pharmacy,
      1
    );

    const key = `${medicine._id}-${pharmacy._id}`;
    setAddedItemMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  };

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(13, 124, 110, 0.08) 0%, rgba(52, 197, 181, 0.06) 100%)",
          border: "1px solid var(--color-border, #e2eceb)",
          borderRadius: "16px",
          padding: "2rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(13, 124, 110, 0.12)", border: "1px solid rgba(13, 124, 110, 0.2)", padding: "0.3rem 0.85rem", borderRadius: "999px", color: "var(--color-primary, #0d7c6e)", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            <Sparkles size={14} /> Multi-Pharmacy Price & Stock Comparison
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: "var(--color-text, #142422)", letterSpacing: "-0.02em" }}>
            Search Medicines in Rajshahi
          </h1>
          <p style={{ color: "var(--color-text-secondary, #2f4847)", margin: 0, maxWidth: "680px", lineHeight: 1.5, fontSize: "0.95rem" }}>
            Compare live prices, batch availability, and delivery options across verified Rajshahi pharmacies for both OTC and prescription medicines.
          </p>
        </div>

        <div>
          <Link
            to="/cart"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              background: "var(--color-primary, #0d7c6e)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              boxShadow: "0 4px 14px rgba(13, 124, 110, 0.25)"
            }}
          >
            <ShoppingCart size={18} /> Cart ({totalItemsCount})
          </Link>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid var(--color-border, #e2eceb)",
          borderRadius: "16px",
          padding: "1.25rem",
          marginBottom: "1.75rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <div style={{ flex: "1 1 320px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted, #47615f)" }} />
            <input
              type="text"
              placeholder="Search by brand name (Napa, Seclo), generic (Paracetamol), or manufacturer (Square)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                borderRadius: "10px",
                border: "1.5px solid var(--color-border, #e2eceb)",
                background: "#ffffff",
                color: "var(--color-text, #142422)",
                fontSize: "0.95rem"
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              background: "var(--color-primary, #0d7c6e)",
              border: "none",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(13, 124, 110, 0.2)"
            }}
          >
            Search
          </button>
        </form>

        {/* Category pills */}
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.35rem" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "0.45rem 0.95rem",
                borderRadius: "999px",
                fontSize: "0.82rem",
                fontWeight: selectedCategory === cat ? 700 : 500,
                whiteSpace: "nowrap",
                cursor: "pointer",
                border: selectedCategory === cat ? "1.5px solid var(--color-primary, #0d7c6e)" : "1px solid var(--color-border, #e2eceb)",
                background: selectedCategory === cat ? "var(--color-primary-light, #eaf6f4)" : "#ffffff",
                color: selectedCategory === cat ? "var(--color-primary-dark, #09594f)" : "var(--color-text-secondary, #2f4847)",
                transition: "all 0.15s ease"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--color-text-secondary, #2f4847)" }}>Searching medicine catalog...</p>
        </div>
      ) : medicines.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "#ffffff", borderRadius: "16px", border: "1px solid var(--color-border, #e2eceb)" }}>
          <AlertCircle size={40} style={{ color: "var(--color-text-muted, #47615f)", margin: "0 auto 1rem" }} />
          <h3 style={{ color: "var(--color-text, #142422)", margin: "0 0 0.5rem" }}>No medicines matched your query</h3>
          <p style={{ color: "var(--color-text-secondary, #2f4847)", margin: 0 }}>Try searching with a generic name (e.g., Paracetamol, Omeprazole) or broad term.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {medicines.map((med) => {
            const isExpanded = expandedMedId === med._id;

            return (
              <div
                key={med._id}
                style={{
                  background: "#ffffff",
                  border: isExpanded ? "1.5px solid var(--color-primary, #0d7c6e)" : "1px solid var(--color-border, #e2eceb)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease"
                }}
              >
                {/* Main Medicine Row */}
                <div style={{ padding: "1.35rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ flex: "1 1 350px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.45rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.55rem", borderRadius: "6px", background: "var(--color-surface-2, #f0f5f4)", color: "var(--color-text-secondary, #2f4847)", border: "1px solid var(--color-border, #e2eceb)", fontWeight: 600 }}>
                        {med.dosage_form} • {med.strength}
                      </span>
                      <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.55rem", borderRadius: "6px", background: "rgba(13, 124, 110, 0.08)", color: "var(--color-primary, #0d7c6e)", border: "1px solid rgba(13, 124, 110, 0.2)", fontWeight: 600 }}>
                        {med.category}
                      </span>

                      {med.requires_prescription ? (
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#c91c1c", background: "rgba(201, 28, 28, 0.1)", border: "1px solid rgba(201, 28, 28, 0.25)", padding: "0.2rem 0.55rem", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <ShieldAlert size={13} /> Prescription Required
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f8a3c", background: "rgba(15, 138, 60, 0.1)", border: "1px solid rgba(15, 138, 60, 0.25)", padding: "0.2rem 0.55rem", borderRadius: "6px" }}>
                          OTC Available
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 0.25rem 0", color: "var(--color-text, #142422)" }}>
                      {med.brand_name}
                    </h3>

                    <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary, #2f4847)", margin: "0 0 0.4rem 0" }}>
                      Generic: <strong style={{ color: "var(--color-text, #142422)" }}>{med.generic_name}</strong>
                    </p>

                    <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted, #47615f)" }}>
                      Mfg: {med.manufacturer} • {med.unit || "strip of 10"}
                    </div>

                    {med.indications && (
                      <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary, #2f4847)", margin: "0.5rem 0 0 0", lineHeight: 1.45 }}>
                        <span style={{ color: "var(--color-text-muted, #47615f)", fontWeight: 600 }}>Indications:</span> {med.indications}
                      </p>
                    )}
                  </div>

                  {/* Price & Compare CTA */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted, #47615f)", fontWeight: 500 }}>Starts from</div>
                      <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--color-primary, #0d7c6e)" }}>
                        ৳{med.unit_price || 30}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted, #47615f)" }}>per {med.unit || "unit"}</div>
                    </div>

                    <button
                      onClick={() => setExpandedMedId(isExpanded ? null : med._id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.65rem 1.25rem",
                        borderRadius: "10px",
                        border: "1.5px solid var(--color-primary, #0d7c6e)",
                        background: isExpanded ? "var(--color-primary, #0d7c6e)" : "var(--color-primary-light, #eaf6f4)",
                        color: isExpanded ? "#ffffff" : "var(--color-primary-dark, #09594f)",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <Store size={16} /> Compare Pharmacies {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Drawer: Pharmacies in Rajshahi stocking this medicine */}
                {isExpanded && (
                  <div
                    style={{
                      background: "var(--color-surface-2, #f8fafb)",
                      borderTop: "1px solid var(--color-border, #e2eceb)",
                      padding: "1.5rem"
                    }}
                  >
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--color-text, #142422)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <Store size={17} color="var(--color-primary, #0d7c6e)" /> Available at Rajshahi Pharmacies:
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                      {DEFAULT_PHARMACIES_STOCK.map((stock) => {
                        const pharmacy = stock.pharmacy;
                        const price = (med.unit_price || 30) + stock.price_offset;
                        const key = `${med._id}-${pharmacy._id}`;
                        const isAdded = addedItemMap[key];

                        return (
                          <div
                            key={pharmacy._id}
                            style={{
                              background: "#ffffff",
                              border: "1.5px solid var(--color-border, #e2eceb)",
                              borderRadius: "12px",
                              padding: "1.1rem",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text, #142422)", marginBottom: "0.25rem" }}>
                                {pharmacy.name}
                              </div>
                              <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary, #2f4847)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <MapPin size={13} color="var(--color-primary, #0d7c6e)" /> {pharmacy.area} • Delivery ~{pharmacy.delivery_eta_mins}m (৳{pharmacy.delivery_fee})
                              </div>
                              <div style={{ fontSize: "0.78rem", color: "#0f8a3c", marginTop: "0.35rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                <Check size={13} /> In Stock ({stock.stock_quantity} units)
                              </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-primary, #0d7c6e)", marginBottom: "0.45rem" }}>
                                ৳{price}
                              </div>
                              <button
                                onClick={() => handleAddToCart(med, stock)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  padding: "0.5rem 0.95rem",
                                  borderRadius: "8px",
                                  border: "none",
                                  background: isAdded ? "#0f8a3c" : "var(--color-primary, #0d7c6e)",
                                  color: "#fff",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                                }}
                              >
                                {isAdded ? (
                                  <>
                                    <Check size={14} /> Added
                                  </>
                                ) : (
                                  <>
                                    <Plus size={14} /> Add
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
