import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  Edit2,
  Trash2,
  Check,
  X,
  Clock,
  Sparkles
} from "lucide-react";

export default function InventoryManager({ inventory = [], onUpdateItem, onAddItem, onDeleteItem }) {
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");

  const [newItem, setNewItem] = useState({
    brand_name: "",
    generic_name: "",
    category: "Analgesic & Antipyretic",
    dosage_form: "Tablet",
    strength: "",
    unit: "strip of 10",
    unit_price: "",
    stock_quantity: "",
    batch_number: "",
    expiry_date: ""
  });

  const filteredInventory = inventory.filter((item) => {
    const med = item.medicine_id || {};
    const name = (med.brand_name || "").toLowerCase();
    const gen = (med.generic_name || "").toLowerCase();
    const s = search.toLowerCase();
    const matchSearch = !search || name.includes(s) || gen.includes(s);

    if (filterRisk === "low_stock") return matchSearch && item.stock_quantity < 30;
    if (filterRisk === "surging") return matchSearch && item.demand_trend === "Surging";
    return matchSearch;
  });

  const handleStartEdit = (item) => {
    setEditingItemId(item._id);
    setEditPrice(item.unit_price);
    setEditStock(item.stock_quantity);
  };

  const handleSaveEdit = (item) => {
    onUpdateItem(item._id, {
      unit_price: Number(editPrice),
      stock_quantity: Number(editStock)
    });
    setEditingItemId(null);
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newItem.brand_name || !newItem.unit_price || !newItem.stock_quantity) {
      alert("Please fill in required medicine name, price, and stock.");
      return;
    }
    onAddItem(newItem);
    setShowAddModal(false);
    setNewItem({
      brand_name: "",
      generic_name: "",
      category: "Analgesic & Antipyretic",
      dosage_form: "Tablet",
      strength: "",
      unit: "strip of 10",
      unit_price: "",
      stock_quantity: "",
      batch_number: "",
      expiry_date: ""
    });
  };

  return (
    <div>
      {/* Top action row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flex: "1 1 300px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted, #64748b)" }} />
            <input
              type="text"
              placeholder="Filter inventory by medicine or generic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem 0.6rem 2.4rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color, #334155)",
                background: "var(--input-bg, #0f172a)",
                color: "#fff",
                fontSize: "0.88rem"
              }}
            />
          </div>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            style={{
              padding: "0.6rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color, #334155)",
              background: "var(--input-bg, #0f172a)",
              color: "#fff",
              fontSize: "0.85rem"
            }}
          >
            <option value="all">All Inventory</option>
            <option value="low_stock">Low Stock Warning (&lt; 30)</option>
            <option value="surging">Surging Demand AI Alert</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "8px",
            background: "var(--teal-600, #0d9488)",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            fontSize: "0.88rem",
            cursor: "pointer"
          }}
        >
          <Plus size={16} /> Add Medicine Stock
        </button>
      </div>

      {/* Inventory Table */}
      <div style={{ overflowX: "auto", background: "var(--card-bg, #1e293b)", borderRadius: "12px", border: "1px solid var(--border-color, #334155)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ background: "rgba(15, 23, 42, 0.6)", color: "var(--text-muted, #94a3b8)", borderBottom: "1px solid var(--border-color, #334155)" }}>
              <th style={{ padding: "0.85rem 1rem" }}>Medicine Name & Generic</th>
              <th style={{ padding: "0.85rem 1rem" }}>Category / Form</th>
              <th style={{ padding: "0.85rem 1rem" }}>Unit Price (৳)</th>
              <th style={{ padding: "0.85rem 1rem" }}>Stock Level</th>
              <th style={{ padding: "0.85rem 1rem" }}>AI Demand Trend</th>
              <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => {
              const med = item.medicine_id || {};
              const isEditing = editingItemId === item._id;
              const isLowStock = item.stock_quantity < 30;

              return (
                <tr
                  key={item._id}
                  style={{
                    borderBottom: "1px solid var(--border-color, #334155)",
                    transition: "background 0.15s ease"
                  }}
                >
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary, #f8fafc)" }}>
                      {med.brand_name || "Unknown Medicine"}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted, #94a3b8)" }}>
                      {med.generic_name} ({med.strength})
                    </div>
                  </td>

                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary, #94a3b8)" }}>
                    {med.category || "General"}
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)" }}>
                      {med.dosage_form}
                    </div>
                  </td>

                  <td style={{ padding: "0.85rem 1rem" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        style={{ width: "70px", padding: "0.3rem", borderRadius: "4px", border: "1px solid #38bdf8", background: "#0f172a", color: "#fff" }}
                      />
                    ) : (
                      <span style={{ fontWeight: 700, color: "var(--teal-400, #2dd4bf)" }}>
                        ৳{item.unit_price}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: "0.85rem 1rem" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        style={{ width: "70px", padding: "0.3rem", borderRadius: "4px", border: "1px solid #38bdf8", background: "#0f172a", color: "#fff" }}
                      />
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontWeight: 700,
                          color: isLowStock ? "#f87171" : "#4ade80"
                        }}
                      >
                        {isLowStock && <AlertTriangle size={14} />}
                        {item.stock_quantity} units
                      </span>
                    )}
                  </td>

                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        background:
                          item.demand_trend === "Surging"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(14,165,233,0.15)",
                        color:
                          item.demand_trend === "Surging"
                            ? "#f87171"
                            : "#38bdf8",
                        fontWeight: 600
                      }}
                    >
                      <Sparkles size={12} /> {item.demand_trend || "Stable"}
                    </span>
                  </td>

                  <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                    {isEditing ? (
                      <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => handleSaveEdit(item)}
                          style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", padding: "0.3rem 0.5rem", cursor: "pointer" }}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          style={{ background: "#64748b", color: "#fff", border: "none", borderRadius: "4px", padding: "0.3rem 0.5rem", cursor: "pointer" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => handleStartEdit(item)}
                          style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary, #94a3b8)", border: "none", borderRadius: "4px", padding: "0.35rem 0.55rem", cursor: "pointer" }}
                          title="Edit Price/Stock"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item._id)}
                          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "none", borderRadius: "4px", padding: "0.35rem 0.55rem", cursor: "pointer" }}
                          title="Remove from inventory"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add New Stock Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
        >
          <div
            style={{
              background: "var(--card-bg, #1e293b)",
              border: "1px solid var(--border-color, #334155)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary, #f8fafc)" }}>
                Add Medicine to Inventory
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNew} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary, #94a3b8)", marginBottom: "0.3rem" }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Napa Extra, Seclo 20"
                  value={newItem.brand_name}
                  onChange={(e) => setNewItem({ ...newItem, brand_name: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color, #334155)", background: "#0f172a", color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary, #94a3b8)", marginBottom: "0.3rem" }}>
                  Generic Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol + Caffeine"
                  value={newItem.generic_name}
                  onChange={(e) => setNewItem({ ...newItem, generic_name: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color, #334155)", background: "#0f172a", color: "#fff" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary, #94a3b8)", marginBottom: "0.3rem" }}>
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color, #334155)", background: "#0f172a", color: "#fff" }}
                  >
                    <option>Analgesic & Antipyretic</option>
                    <option>Gastrointestinal</option>
                    <option>Antibiotic</option>
                    <option>Antihistamine</option>
                    <option>Vitamin & Mineral</option>
                    <option>Respiratory</option>
                    <option>Cardiovascular</option>
                    <option>Antidiabetic</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary, #94a3b8)", marginBottom: "0.3rem" }}>
                    Strength
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={newItem.strength}
                    onChange={(e) => setNewItem({ ...newItem, strength: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color, #334155)", background: "#0f172a", color: "#fff" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary, #94a3b8)", marginBottom: "0.3rem" }}>
                    Unit Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="30"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color, #334155)", background: "#0f172a", color: "#fff" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary, #94a3b8)", marginBottom: "0.3rem" }}>
                    Initial Stock Qty *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="100"
                    value={newItem.stock_quantity}
                    onChange={(e) => setNewItem({ ...newItem, stock_quantity: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--border-color, #334155)", background: "#0f172a", color: "#fff" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", background: "var(--teal-600, #0d9488)", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
