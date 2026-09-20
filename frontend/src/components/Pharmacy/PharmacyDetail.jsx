import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Truck,
  Star,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  ArrowLeft,
  ShieldAlert,
  Filter
} from "lucide-react";
import { pharmaciesAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";

const CATEGORIES = [
  "All",
  "Analgesic & Antipyretic",
  "Gastrointestinal",
  "Antibiotic",
  "Antihistamine",
  "Vitamin & Mineral",
  "Emergency & Critical",
  "Cardiovascular",
  "Antidiabetic"
];

// Fallback medicines for pharmacy detail if API backend is starting
const DEFAULT_INVENTORY = [
  {
    _id: "inv-1",
    medicine_id: {
      _id: "med-1",
      brand_name: "Napa Extra",
      generic_name: "Paracetamol + Caffeine",
      category: "Analgesic & Antipyretic",
      dosage_form: "Tablet",
      strength: "500mg + 65mg",
      unit: "strip of 10",
      requires_prescription: false
    },
    unit_price: 30,
    stock_quantity: 250,
    in_stock: true,
    demand_trend: "Surging"
  },
  {
    _id: "inv-2",
    medicine_id: {
      _id: "med-2",
      brand_name: "Seclo 20",
      generic_name: "Omeprazole",
      category: "Gastrointestinal",
      dosage_form: "Capsule",
      strength: "20mg",
      unit: "strip of 10",
      requires_prescription: false
    },
    unit_price: 70,
    stock_quantity: 180,
    in_stock: true,
    demand_trend: "Stable"
  },
  {
    _id: "inv-3",
    medicine_id: {
      _id: "med-3",
      brand_name: "Maxpro 20",
      generic_name: "Esomeprazole",
      category: "Gastrointestinal",
      dosage_form: "Tablet",
      strength: "20mg",
      unit: "strip of 10",
      requires_prescription: false
    },
    unit_price: 80,
    stock_quantity: 120,
    in_stock: true,
    demand_trend: "Stable"
  },
  {
    _id: "inv-4",
    medicine_id: {
      _id: "med-4",
      brand_name: "Fexo 120",
      generic_name: "Fexofenadine HCl",
      category: "Antihistamine",
      dosage_form: "Tablet",
      strength: "120mg",
      unit: "strip of 10",
      requires_prescription: false
    },
    unit_price: 90,
    stock_quantity: 95,
    in_stock: true,
    demand_trend: "Stable"
  },
  {
    _id: "inv-5",
    medicine_id: {
      _id: "med-5",
      brand_name: "Ceevit",
      generic_name: "Vitamin C (Ascorbic Acid)",
      category: "Vitamin & Mineral",
      dosage_form: "Tablet",
      strength: "250mg",
      unit: "strip of 10",
      requires_prescription: false
    },
    unit_price: 25,
    stock_quantity: 340,
    in_stock: true,
    demand_trend: "Surging"
  },
  {
    _id: "inv-6",
    medicine_id: {
      _id: "med-6",
      brand_name: "Zithrin 500",
      generic_name: "Azithromycin",
      category: "Antibiotic",
      dosage_form: "Tablet",
      strength: "500mg",
      unit: "strip of 3",
      requires_prescription: true
    },
    unit_price: 120,
    stock_quantity: 45,
    in_stock: true,
    demand_trend: "High Demand"
  },
  {
    _id: "inv-7",
    medicine_id: {
      _id: "med-7",
      brand_name: "ORSaline-N",
      generic_name: "Oral Rehydration Salts",
      category: "Emergency & Critical",
      dosage_form: "Sachet",
      strength: "Standard WHO",
      unit: "sachet",
      unit_price: 6,
      stock_quantity: 500,
      in_stock: true,
      demand_trend: "Surging"
    },
    unit_price: 6,
    stock_quantity: 500,
    in_stock: true,
    demand_trend: "Surging"
  }
];

export default function PharmacyDetail() {
  const { id } = useParams();
  const { addToCart, totalItemsCount } = useCart();

  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addedItemMap, setAddedItemMap] = useState({});

  useEffect(() => {
    fetchPharmacyData();
  }, [id]);

  const fetchPharmacyData = async () => {
    setLoading(true);
    try {
      const res = await pharmaciesAPI.getById(id);
      if (res.data && res.data.pharmacy) {
        setPharmacy(res.data.pharmacy);
        setInventory(res.data.inventory || []);
      } else {
        useFallbackData();
      }
    } catch {
      useFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackData = () => {
    setPharmacy({
      _id: id,
      name: "Niramoy Model Pharmacy - Laxmipur",
      area: "Laxmipur",
      address: "Holding 142, Medical College Main Gate Road, Laxmipur, Rajshahi",
      phone: "+880 1711-445566",
      rating: 4.9,
      review_count: 142,
      is_24_7: true,
      delivery_available: true,
      delivery_fee: 30,
      delivery_eta_mins: 20,
      free_delivery_above: 400,
      opening_hours: { open: "12:00 AM", close: "11:59 PM" }
    });
    setInventory(DEFAULT_INVENTORY);
  };

  const handleAddToCart = (item) => {
    const med = {
      _id: item.medicine_id._id,
      brand_name: item.medicine_id.brand_name,
      generic_name: item.medicine_id.generic_name,
      dosage_form: item.medicine_id.dosage_form,
      strength: item.medicine_id.strength,
      unit_price: item.unit_price,
      requires_prescription: item.medicine_id.requires_prescription
    };

    addToCart(med, pharmacy, 1);

    // Show temporary checked indicator
    setAddedItemMap((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [item._id]: false }));
    }, 1500);
  };

  const filteredInventory = inventory.filter((item) => {
    if (!item.medicine_id) return false;
    const med = item.medicine_id;
    const matchCat =
      selectedCategory === "All" || med.category === selectedCategory;
    const s = search.toLowerCase();
    const matchSearch =
      !search ||
      med.brand_name.toLowerCase().includes(s) ||
      med.generic_name.toLowerCase().includes(s) ||
      (med.category && med.category.toLowerCase().includes(s));
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 1rem" }} />
        <p style={{ color: "var(--text-secondary, #94a3b8)" }}>Loading pharmacy inventory...</p>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <h2>Pharmacy Not Found</h2>
        <Link to="/pharmacies" className="btn btn-secondary">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Back button & Cart summary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <Link
          to="/pharmacies"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--color-primary, #0d7c6e)",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 700
          }}
        >
          <ArrowLeft size={16} /> Back to Pharmacy Directory
        </Link>

        <Link
          to="/cart"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "10px",
            background: "var(--color-primary, #0d7c6e)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
            boxShadow: "0 4px 12px rgba(13, 124, 110, 0.25)"
          }}
        >
          <ShoppingCart size={18} /> View Cart ({totalItemsCount})
        </Link>
      </div>

      {/* Pharmacy Header Card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid var(--color-border, #e2eceb)",
          borderRadius: "16px",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span
                style={{
                  background: "rgba(13, 124, 110, 0.1)",
                  color: "var(--color-primary, #0d7c6e)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(13, 124, 110, 0.2)"
                }}
              >
                {pharmacy.area}, Rajshahi
              </span>
              {pharmacy.is_24_7 && (
                <span style={{ background: "rgba(201, 28, 28, 0.1)", color: "#c91c1c", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(201, 28, 28, 0.25)" }}>
                  ⚡ 24/7 Dispensing
                </span>
              )}
            </div>

            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: "var(--color-text, #142422)", letterSpacing: "-0.02em" }}>
              {pharmacy.name}
            </h1>

            <p style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-text-secondary, #2f4847)", margin: "0 0 0.75rem 0" }}>
              <MapPin size={16} color="var(--color-primary, #0d7c6e)" /> {pharmacy.address}
            </p>

            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.88rem", color: "var(--color-text-secondary, #2f4847)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Clock size={15} color="var(--color-primary, #0d7c6e)" /> {pharmacy.is_24_7 ? "Open 24 Hours" : `${pharmacy.opening_hours?.open} - ${pharmacy.opening_hours?.close}`}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Phone size={15} color="var(--color-primary, #0d7c6e)" /> <a href={`tel:${pharmacy.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{pharmacy.phone}</a>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Truck size={15} color="var(--color-primary, #0d7c6e)" /> Delivery: ৳{pharmacy.delivery_fee || 35} (Free above ৳{pharmacy.free_delivery_above || 500})
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(194, 94, 0, 0.1)", padding: "0.5rem 1rem", borderRadius: "10px", color: "#c25e00", fontWeight: 800, fontSize: "1.1rem", border: "1px solid rgba(194, 94, 0, 0.25)" }}>
              <Star size={18} fill="#c25e00" /> {pharmacy.rating || 4.8} / 5.0
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #47615f)", marginTop: "0.25rem" }}>
              {pharmacy.review_count || 120}+ patient reviews
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Search & Filters */}
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
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <div style={{ flex: "1 1 300px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted, #47615f)" }} />
            <input
              type="text"
              placeholder="Search medicines in this store (e.g. Napa, Seclo, Ceevit)..."
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
        </div>

        {/* Category tabs */}
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

      {/* Medicines Inventory Grid */}
      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 1rem 0", color: "var(--color-text, #142422)" }}>
        Available Stock ({filteredInventory.length} items)
      </h2>

      {filteredInventory.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "#ffffff", borderRadius: "16px", border: "1px solid var(--color-border, #e2eceb)" }}>
          <p style={{ color: "var(--color-text-secondary, #2f4847)" }}>No medicines found matching your search.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {filteredInventory.map((item) => {
            const med = item.medicine_id;
            const isAdded = addedItemMap[item._id];

            return (
              <div
                key={item._id}
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--color-border, #e2eceb)",
                  borderRadius: "14px",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.55rem", borderRadius: "6px", background: "var(--color-surface-2, #f0f5f4)", color: "var(--color-text-secondary, #2f4847)", border: "1px solid var(--color-border, #e2eceb)", fontWeight: 600 }}>
                      {med.dosage_form} • {med.strength}
                    </span>

                    {med.requires_prescription ? (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#c91c1c", background: "rgba(201, 28, 28, 0.1)", border: "1px solid rgba(201, 28, 28, 0.25)", padding: "0.15rem 0.45rem", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                        <ShieldAlert size={12} /> Rx Required
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f8a3c", background: "rgba(15, 138, 60, 0.1)", border: "1px solid rgba(15, 138, 60, 0.25)", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                        OTC
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 0.25rem 0", color: "var(--color-text, #142422)" }}>
                    {med.brand_name}
                  </h3>

                  <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary, #2f4847)", margin: "0 0 0.5rem 0" }}>
                    {med.generic_name}
                  </p>

                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted, #47615f)", marginBottom: "0.75rem" }}>
                    {med.unit || "strip of 10"} • Stock: {item.stock_quantity} available
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid var(--color-border, #e2eceb)" }}>
                  <div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-primary, #0d7c6e)" }}>
                      ৳{item.unit_price}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.in_stock || item.stock_quantity <= 0}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.55rem 1rem",
                      borderRadius: "8px",
                      border: "none",
                      background: isAdded ? "#0f8a3c" : "var(--color-primary, #0d7c6e)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(13, 124, 110, 0.2)",
                      transition: "background 0.2s ease"
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check size={15} /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={15} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
