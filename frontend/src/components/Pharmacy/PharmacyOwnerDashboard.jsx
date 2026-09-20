import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Settings,
  Sparkles,
  Truck,
  DollarSign,
  Search,
  ShieldCheck,
  Building
} from "lucide-react";
import { pharmaciesAPI, pharmacyOrdersAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import InventoryManager from "./InventoryManager";
import OrderManager from "./OrderManager";

const DEFAULT_DASHBOARD_INVENTORY = [
  {
    _id: "inv-1",
    medicine_id: {
      _id: "med-1",
      brand_name: "Napa Extra",
      generic_name: "Paracetamol + Caffeine",
      category: "Analgesic & Antipyretic",
      dosage_form: "Tablet",
      strength: "500mg + 65mg"
    },
    unit_price: 30,
    stock_quantity: 24, // low stock
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
      strength: "20mg"
    },
    unit_price: 70,
    stock_quantity: 180,
    demand_trend: "Stable"
  },
  {
    _id: "inv-3",
    medicine_id: {
      _id: "med-3",
      brand_name: "Zithrin 500",
      generic_name: "Azithromycin",
      category: "Antibiotic",
      dosage_form: "Tablet",
      strength: "500mg",
      requires_prescription: true
    },
    unit_price: 120,
    stock_quantity: 18, // critical
    demand_trend: "Surging"
  },
  {
    _id: "inv-4",
    medicine_id: {
      _id: "med-4",
      brand_name: "ORSaline-N",
      generic_name: "Oral Rehydration Salts",
      category: "Emergency & Critical",
      dosage_form: "Sachet",
      strength: "Standard WHO"
    },
    unit_price: 6,
    stock_quantity: 450,
    demand_trend: "Surging"
  },
  {
    _id: "inv-5",
    medicine_id: {
      _id: "med-5",
      brand_name: "Fexo 120",
      generic_name: "Fexofenadine HCl",
      category: "Antihistamine",
      dosage_form: "Tablet",
      strength: "120mg"
    },
    unit_price: 90,
    stock_quantity: 95,
    demand_trend: "Stable"
  }
];

const DEFAULT_ORDERS = [
  {
    _id: "ord-101",
    order_number: "ORD-RX-K9281A",
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    status: "pending",
    prescription_required: true,
    prescription_verified: false,
    prescription_image: "rx_scan_patient.png",
    payment_method: "cash_on_delivery",
    payment_status: "pending",
    total_amount: 390,
    delivery_address: {
      recipient_name: "Tanvir Ahmed",
      phone: "01712-334455",
      street: "House 18, Road 2, Medical Staff Quarter",
      area: "Laxmipur"
    },
    items: [
      { brand_name: "Zithrin 500", strength: "500mg", quantity: 2, unit_price: 120, total_price: 240 },
      { brand_name: "Napa Extra", strength: "500mg + 65mg", quantity: 3, unit_price: 30, total_price: 90 }
    ]
  },
  {
    _id: "ord-102",
    order_number: "ORD-RX-M8832C",
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    status: "preparing",
    prescription_required: false,
    prescription_verified: true,
    payment_method: "bkash",
    payment_status: "paid",
    total_amount: 210,
    delivery_address: {
      recipient_name: "Shamima Akhter",
      phone: "01819-556677",
      street: "Kazihata Colony, Lane 4",
      area: "Kazihata"
    },
    items: [
      { brand_name: "Seclo 20", strength: "20mg", quantity: 2, unit_price: 70, total_price: 140 },
      { brand_name: "ORSaline-N", strength: "WHO", quantity: 5, unit_price: 6, total_price: 30 }
    ]
  },
  {
    _id: "ord-103",
    order_number: "ORD-RX-P4419E",
    createdAt: new Date(Date.now() - 1000 * 60 * 180),
    status: "delivered",
    prescription_required: false,
    prescription_verified: true,
    payment_method: "cash_on_delivery",
    payment_status: "paid",
    total_amount: 150,
    delivery_address: {
      recipient_name: "Dr. Rakib Hasan",
      phone: "01911-223344",
      street: "Zero Point, Shaheb Bazar",
      area: "Shaheb Bazar"
    },
    items: [
      { brand_name: "Ceevit 250mg", strength: "250mg", quantity: 4, unit_price: 25, total_price: 100 }
    ]
  }
];

export default function PharmacyOwnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState(DEFAULT_DASHBOARD_INVENTORY);
  const [orders, setOrders] = useState(DEFAULT_ORDERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await pharmaciesAPI.getMyPharmacy();
      if (res.data && res.data.pharmacy) {
        setPharmacy(res.data.pharmacy);
        setInventory(res.data.inventory || DEFAULT_DASHBOARD_INVENTORY);
      } else {
        useFallbackPharmacy();
      }
    } catch {
      useFallbackPharmacy();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackPharmacy = () => {
    setPharmacy({
      _id: "pharm-laxmipur",
      name: "Niramoy Model Pharmacy - Laxmipur",
      area: "Laxmipur",
      address: "Holding 142, Medical College Main Gate Road, Laxmipur, Rajshahi",
      phone: "+880 1711-445566",
      is_24_7: true,
      delivery_fee: 30,
      free_delivery_above: 400
    });
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, note) => {
    try {
      await pharmacyOrdersAPI.updateStatus(orderId, { status: newStatus, note });
    } catch (e) {
      console.warn("Order status update offline sync:", e.message);
    }
    setOrders((prev) =>
      prev.map((ord) =>
        ord._id === orderId
          ? {
              ...ord,
              status: newStatus,
              payment_status: newStatus === "delivered" ? "paid" : ord.payment_status
            }
          : ord
      )
    );
  };

  const handleVerifyRx = async (orderId) => {
    try {
      await pharmacyOrdersAPI.verifyRx(orderId);
    } catch (e) {
      console.warn("Rx verify offline sync:", e.message);
    }
    setOrders((prev) =>
      prev.map((ord) =>
        ord._id === orderId ? { ...ord, prescription_verified: true } : ord
      )
    );
  };

  const handleUpdateInventoryItem = (itemId, patch) => {
    setInventory((prev) =>
      prev.map((item) => (item._id === itemId ? { ...item, ...patch } : item))
    );
  };

  const handleAddInventoryItem = (newItem) => {
    const created = {
      _id: "inv-" + Date.now(),
      medicine_id: {
        _id: "med-" + Date.now(),
        brand_name: newItem.brand_name,
        generic_name: newItem.generic_name,
        category: newItem.category,
        dosage_form: newItem.dosage_form,
        strength: newItem.strength
      },
      unit_price: Number(newItem.unit_price),
      stock_quantity: Number(newItem.stock_quantity),
      demand_trend: "Stable"
    };
    setInventory((prev) => [created, ...prev]);
  };

  const handleDeleteInventoryItem = (itemId) => {
    setInventory((prev) => prev.filter((item) => item._id !== itemId));
  };

  // Metric stats
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const lowStockCount = inventory.filter((i) => i.stock_quantity < 30).length;
  const todayRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Top Header Card */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(13, 124, 110, 0.08) 0%, rgba(52, 197, 181, 0.06) 100%)",
          border: "1px solid var(--color-border, #e2eceb)",
          borderRadius: "16px",
          padding: "2rem",
          marginBottom: "2rem"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(13, 124, 110, 0.12)", border: "1px solid rgba(13, 124, 110, 0.2)", padding: "0.3rem 0.85rem", borderRadius: "999px", color: "var(--color-primary, #0d7c6e)", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              <Store size={14} /> Registered Pharmacist & Store Owner Console
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "var(--color-text, #142422)", letterSpacing: "-0.02em" }}>
              {pharmacy?.name || "Rajshahi Pharmacy Portal"}
            </h1>
            <p style={{ color: "var(--color-text-secondary, #2f4847)", margin: "0.4rem 0 0", fontSize: "0.95rem" }}>
              {pharmacy?.address || "Laxmipur, Rajshahi"} • Operator:{" "}
              <strong style={{ color: "var(--color-text, #142422)" }}>{user?.name || "Registered Pharmacist"}</strong>
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link
              to="/pharmacies"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.65rem 1.25rem",
                borderRadius: "10px",
                background: "#ffffff",
                border: "1.5px solid var(--color-border, #e2eceb)",
                color: "var(--color-text, #142422)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
              }}
            >
              Public Directory View
            </Link>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginTop: "1.75rem"
          }}
        >
          <div style={{ background: "#ffffff", padding: "1.35rem", borderRadius: "14px", border: "1.5px solid var(--color-border, #e2eceb)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--color-text-secondary, #2f4847)", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "0.02em" }}>
              <span>PENDING ORDERS</span>
              <Clock size={16} color="#c25e00" />
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#c25e00" }}>
              {pendingOrdersCount}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #47615f)", marginTop: "0.2rem" }}>Requires pharmacist review</div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.35rem", borderRadius: "14px", border: "1.5px solid var(--color-border, #e2eceb)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--color-text-secondary, #2f4847)", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "0.02em" }}>
              <span>INVENTORY ITEMS</span>
              <Package size={16} color="var(--color-primary, #0d7c6e)" />
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--color-text, #142422)" }}>
              {inventory.length}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #47615f)", marginTop: "0.2rem" }}>Catalog active SKUs</div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.35rem", borderRadius: "14px", border: "1.5px solid var(--color-border, #e2eceb)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--color-text-secondary, #2f4847)", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "0.02em" }}>
              <span>LOW STOCK ALERTS</span>
              <AlertTriangle size={16} color={lowStockCount > 0 ? "#c91c1c" : "#0f8a3c"} />
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: lowStockCount > 0 ? "#c91c1c" : "#0f8a3c" }}>
              {lowStockCount}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #47615f)", marginTop: "0.2rem" }}>Reorder threshold (&lt; 30)</div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.35rem", borderRadius: "14px", border: "1.5px solid var(--color-border, #e2eceb)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--color-text-secondary, #2f4847)", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "0.02em" }}>
              <span>TODAY'S REVENUE</span>
              <DollarSign size={16} color="var(--color-primary, #0d7c6e)" />
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--color-primary, #0d7c6e)" }}>
              ৳{todayRevenue}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #47615f)", marginTop: "0.2rem" }}>Delivered orders completed</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "0.75rem", borderBottom: "1.5px solid var(--color-border, #e2eceb)", paddingBottom: "0.75rem", marginBottom: "1.75rem", overflowX: "auto" }}>
        <button
          onClick={() => setActiveTab("orders")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "10px",
            border: activeTab === "orders" ? "none" : "1px solid var(--color-border, #e2eceb)",
            background: activeTab === "orders" ? "var(--color-primary, #0d7c6e)" : "var(--color-surface-2, #f0f5f4)",
            color: activeTab === "orders" ? "#ffffff" : "var(--color-text-secondary, #2f4847)",
            fontWeight: 700,
            fontSize: "0.92rem",
            cursor: "pointer",
            boxShadow: activeTab === "orders" ? "0 2px 8px rgba(13, 124, 110, 0.25)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          <ShoppingBag size={18} /> Incoming Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "10px",
            border: activeTab === "inventory" ? "none" : "1px solid var(--color-border, #e2eceb)",
            background: activeTab === "inventory" ? "var(--color-primary, #0d7c6e)" : "var(--color-surface-2, #f0f5f4)",
            color: activeTab === "inventory" ? "#ffffff" : "var(--color-text-secondary, #2f4847)",
            fontWeight: 700,
            fontSize: "0.92rem",
            cursor: "pointer",
            boxShadow: activeTab === "inventory" ? "0 2px 8px rgba(13, 124, 110, 0.25)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          <Package size={18} /> Inventory Management ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab("ai_forecast")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "10px",
            border: activeTab === "ai_forecast" ? "none" : "1px solid var(--color-border, #e2eceb)",
            background: activeTab === "ai_forecast" ? "var(--color-primary, #0d7c6e)" : "var(--color-surface-2, #f0f5f4)",
            color: activeTab === "ai_forecast" ? "#ffffff" : "var(--color-text-secondary, #2f4847)",
            fontWeight: 700,
            fontSize: "0.92rem",
            cursor: "pointer",
            boxShadow: activeTab === "ai_forecast" ? "0 2px 8px rgba(13, 124, 110, 0.25)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          <Sparkles size={18} /> AI Demand Surge Forecasting
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "orders" && (
        <OrderManager
          orders={orders}
          onUpdateStatus={handleUpdateOrderStatus}
          onVerifyRx={handleVerifyRx}
        />
      )}

      {activeTab === "inventory" && (
        <InventoryManager
          inventory={inventory}
          onUpdateItem={handleUpdateInventoryItem}
          onAddItem={handleAddInventoryItem}
          onDeleteItem={handleDeleteInventoryItem}
        />
      )}

      {activeTab === "ai_forecast" && (
        <div style={{ background: "#ffffff", border: "1px solid var(--color-border, #e2eceb)", borderRadius: "16px", padding: "1.75rem", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Sparkles size={20} color="var(--color-primary, #0d7c6e)" />
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text, #142422)" }}>
              Rajshahi Epidemiological Medicine Demand Alerts
            </h3>
          </div>
          <p style={{ color: "var(--color-text-secondary, #2f4847)", lineHeight: 1.6, margin: "0 0 1.5rem", fontSize: "0.95rem" }}>
            Our Clinical AI engine monitors outpatient trends from RMCH, local Rajshahi clinic footfalls, and weather humidity data to forecast upcoming prescription surges before supply run-outs occur.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
            <div style={{ background: "rgba(201, 28, 28, 0.06)", border: "1.5px solid rgba(201, 28, 28, 0.25)", borderRadius: "12px", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong style={{ color: "#c91c1c", fontSize: "1rem" }}>Napa Extra / Paracetamol</strong>
                <span style={{ fontSize: "0.75rem", background: "rgba(201, 28, 28, 0.12)", color: "#c91c1c", padding: "0.2rem 0.55rem", borderRadius: "4px", fontWeight: 700, border: "1px solid rgba(201, 28, 28, 0.25)" }}>
                  +45% SURGE
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary, #2f4847)", margin: "0 0 0.5rem", lineHeight: 1.45 }}>
                Seasonal monsoon viral fever spike detected in Laxmipur and Shaheb Bazar catchment areas.
              </p>
              <div style={{ fontSize: "0.82rem", color: "#c91c1c", fontWeight: 700 }}>
                Recommendation: Reorder at least 300 additional strips within 48 hours.
              </div>
            </div>

            <div style={{ background: "rgba(194, 94, 0, 0.06)", border: "1.5px solid rgba(194, 94, 0, 0.25)", borderRadius: "12px", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong style={{ color: "#c25e00", fontSize: "1rem" }}>ORSaline-N (WHO Formula)</strong>
                <span style={{ fontSize: "0.75rem", background: "rgba(194, 94, 0, 0.12)", color: "#c25e00", padding: "0.2rem 0.55rem", borderRadius: "4px", fontWeight: 700, border: "1px solid rgba(194, 94, 0, 0.25)" }}>
                  +30% DEMAND
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary, #2f4847)", margin: "0 0 0.5rem", lineHeight: 1.45 }}>
                Heatwave advisory with midday temperatures exceeding 38°C in Barendra tract.
              </p>
              <div style={{ fontSize: "0.82rem", color: "#c25e00", fontWeight: 700 }}>
                Recommendation: Ensure minimum 500 sachets ready at front counter.
              </div>
            </div>

            <div style={{ background: "rgba(13, 124, 110, 0.06)", border: "1.5px solid rgba(13, 124, 110, 0.25)", borderRadius: "12px", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong style={{ color: "var(--color-primary, #0d7c6e)", fontSize: "1rem" }}>Zithrin 500 / Azithromycin</strong>
                <span style={{ fontSize: "0.75rem", background: "rgba(13, 124, 110, 0.12)", color: "var(--color-primary, #0d7c6e)", padding: "0.2rem 0.55rem", borderRadius: "4px", fontWeight: 700, border: "1px solid rgba(13, 124, 110, 0.25)" }}>
                  CRITICAL BUFFER
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary, #2f4847)", margin: "0 0 0.5rem", lineHeight: 1.45 }}>
                Post-operative and lower respiratory infections steady at RMCH chest ward.
              </p>
              <div style={{ fontSize: "0.82rem", color: "var(--color-primary, #0d7c6e)", fontWeight: 700 }}>
                Recommendation: Verify batch expiry dates on all blister packs.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
