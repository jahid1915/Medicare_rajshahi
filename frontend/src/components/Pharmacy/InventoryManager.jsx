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
  Sparkles,
  Upload,
  Download,
  FileSpreadsheet,
  CheckSquare,
  Square,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ChevronDown
} from "lucide-react";
import { pharmaciesAPI } from "../../services/api";

export default function InventoryManager({
  inventory = [],
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onRefresh
}) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("add_stock");
  const [bulkValue, setBulkValue] = useState("");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Excel Export Dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Excel Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

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
    expiry_date: "",
    reorder_level: 20
  });

  // Helper to compute stock status and expiry
  const getItemStatus = (item) => {
    const qty = item.available_quantity ?? item.stock_quantity ?? 0;
    const reorder = item.reorder_level ?? 20;

    let isExpired = false;
    let daysUntilExpiry = 999;
    if (item.expiry_date) {
      const exp = new Date(item.expiry_date);
      const now = new Date();
      daysUntilExpiry = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 0) isExpired = true;
    }

    if (isExpired) return { code: "EXPIRED", label: "Expired", color: "#dc2626", bg: "#fee2e2" };
    if (qty <= 0) return { code: "OUT_OF_STOCK", label: "Out of Stock", color: "#991b1b", bg: "#fee2e2" };
    if (qty <= reorder) return { code: "LOW_STOCK", label: `Low Stock (${qty})`, color: "#b45309", bg: "#fef3c7" };
    return { code: "IN_STOCK", label: `In Stock (${qty})`, color: "#15803d", bg: "#dcfce7" };
  };

  const filteredInventory = inventory.filter((item) => {
    const med = item.medicine_id || {};
    const name = (med.brand_name || "").toLowerCase();
    const gen = (med.generic_name || "").toLowerCase();
    const s = search.toLowerCase();
    const matchSearch = !search || name.includes(s) || gen.includes(s);

    const matchCategory =
      filterCategory === "all" || (med.category || "").toLowerCase() === filterCategory.toLowerCase();

    const statusObj = getItemStatus(item);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "low_stock" && (statusObj.code === "LOW_STOCK" || statusObj.code === "OUT_OF_STOCK")) ||
      (filterStatus === "expired" && statusObj.code === "EXPIRED") ||
      (filterStatus === "in_stock" && statusObj.code === "IN_STOCK");

    return matchSearch && matchCategory && matchStatus;
  });

  const allFilteredSelected =
    filteredInventory.length > 0 &&
    filteredInventory.every((item) => selectedIds.includes(item._id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInventory.map((i) => i._id));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item._id);
    setEditPrice(item.unit_price ?? item.sellingPrice ?? "");
    setEditStock(item.stock_quantity ?? item.quantity ?? "");
  };

  const handleSaveEdit = (item) => {
    onUpdateItem(item._id, {
      unit_price: Number(editPrice),
      stock_quantity: Number(editStock)
    });
    setEditingItemId(null);
    showToast(`Updated stock & price for ${item.medicine_id?.brand_name || "item"}.`);
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newItem.brand_name || !newItem.unit_price || !newItem.stock_quantity) {
      alert("Please fill in required medicine name, price, and stock.");
      return;
    }
    onAddItem(newItem);
    setShowAddModal(false);
    showToast(`Added ${newItem.brand_name} to pharmacy inventory.`);
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
      expiry_date: "",
      reorder_level: 20
    });
  };

  // Bulk stock update action
  const handleApplyBulkUpdate = async () => {
    if (!bulkValue || isNaN(bulkValue)) {
      alert("Please enter a valid numeric value for the bulk action.");
      return;
    }

    setBulkLoading(true);
    try {
      await pharmaciesAPI.bulkUpdateStock({
        inventoryIds: selectedIds,
        action: bulkAction,
        value: Number(bulkValue),
        reason: bulkReason || `Bulk ${bulkAction} applied by pharmacist`
      });

      showToast(`Bulk update applied successfully to ${selectedIds.length} medicines.`);
      setSelectedIds([]);
      setBulkValue("");
      setBulkReason("");
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || "Failed to execute bulk update.");
    } finally {
      setBulkLoading(false);
    }
  };

  // Excel Import Preview Handler
  const handleUploadPreview = async (e) => {
    e.preventDefault();
    if (!importFile) return;

    setImportLoading(true);
    setImportError("");
    setImportPreview(null);

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await pharmaciesAPI.importExcelPreview(formData);
      if (res && res.data) {
        setImportPreview(res.data);
      }
    } catch (err) {
      setImportError(err.message || "Failed to process Excel spreadsheet.");
    } finally {
      setImportLoading(false);
    }
  };

  // Confirm Excel Import Handler
  const handleConfirmImport = async () => {
    if (!importPreview?.importBatchId) return;

    setImportLoading(true);
    try {
      await pharmaciesAPI.confirmExcelImport({
        importBatchId: importPreview.importBatchId
      });

      setImportSuccess(true);
      showToast(`Successfully imported ${importPreview.validCount} medicines into inventory!`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview(null);
        setImportSuccess(false);
        if (onRefresh) onRefresh();
      }, 1500);
    } catch (err) {
      setImportError(err.message || "Failed to confirm Excel import.");
    } finally {
      setImportLoading(false);
    }
  };

  // Trigger Excel Export Download
  const handleExportDownload = (filter = "all") => {
    const url = pharmaciesAPI.getExportUrl(filter);
    window.open(url, "_blank");
    setShowExportMenu(false);
    showToast(`Downloading ${filter} inventory Excel report...`);
  };

  return (
    <div>
      {/* Action Notification Toast */}
      {toast && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: toast.type === "success" ? "#dcfce7" : "#fee2e2",
            color: toast.type === "success" ? "#166534" : "#991b1b",
            border: `1px solid ${toast.type === "success" ? "#86efac" : "#fca5a5"}`
          }}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Top Action & Filter Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem"
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", flex: "1 1 340px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "0.9rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted, #47615f)"
              }}
            />
            <input
              type="text"
              placeholder="Search medicine brand or generic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.75rem 0.65rem 2.4rem",
                borderRadius: "10px",
                border: "1.5px solid var(--color-border, #e2eceb)",
                background: "#ffffff",
                color: "var(--color-text, #142422)",
                fontSize: "0.88rem"
              }}
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: "0.65rem 0.85rem",
              borderRadius: "10px",
              border: "1.5px solid var(--color-border, #e2eceb)",
              background: "#ffffff",
              color: "var(--color-text, #142422)",
              fontSize: "0.85rem",
              fontWeight: 600
            }}
          >
            <option value="all">All Categories</option>
            <option value="Analgesic & Antipyretic">Analgesic & Antipyretic</option>
            <option value="Antibiotic">Antibiotic</option>
            <option value="Gastrointestinal">Gastrointestinal</option>
            <option value="Antihistamine">Antihistamine</option>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Antidiabetic">Antidiabetic</option>
            <option value="Emergency & Critical">Emergency & Critical</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "0.65rem 0.85rem",
              borderRadius: "10px",
              border: "1.5px solid var(--color-border, #e2eceb)",
              background: "#ffffff",
              color: "var(--color-text, #142422)",
              fontSize: "0.85rem",
              fontWeight: 600
            }}
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low_stock">Low / Out of Stock</option>
            <option value="expired">Expired Warning</option>
          </select>
        </div>

        {/* Action Buttons: Add Medicine, Import Excel, Export Dropdown */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Import Excel */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.65rem 1.1rem",
              borderRadius: "10px",
              background: "#ffffff",
              border: "1.5px solid var(--color-border, #e2eceb)",
              color: "var(--color-text, #142422)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            <Upload size={15} style={{ color: "var(--color-primary, #0d7c6e)" }} /> Import Excel
          </button>

          {/* Export Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowExportMenu((prev) => !prev)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.65rem 1.1rem",
                borderRadius: "10px",
                background: "#ffffff",
                border: "1.5px solid var(--color-border, #e2eceb)",
                color: "var(--color-text, #142422)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              <Download size={15} style={{ color: "var(--color-primary, #0d7c6e)" }} /> Export
              <ChevronDown size={14} />
            </button>

            {showExportMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "115%",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1.5px solid var(--color-border, #e2eceb)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  zIndex: 50,
                  minWidth: "190px",
                  padding: "6px"
                }}
              >
                {[
                  { label: "Export All Items", filter: "all" },
                  { label: "Export In-Stock Only", filter: "in_stock" },
                  { label: "Export Low Stock (< 30)", filter: "low_stock" },
                  { label: "Export Out of Stock", filter: "out_of_stock" },
                  { label: "Export Expiring Soon", filter: "expiring_soon" }
                ].map((opt) => (
                  <button
                    key={opt.filter}
                    type="button"
                    onClick={() => handleExportDownload(opt.filter)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "transparent",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--color-text, #142422)",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => (e.target.style.background = "var(--color-surface-2, #f0f5f4)")}
                    onMouseLeave={(e) => (e.target.style.background = "transparent")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Medicine Stock */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.65rem 1.25rem",
              borderRadius: "10px",
              background: "var(--color-primary, #0d7c6e)",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(13, 124, 110, 0.2)"
            }}
          >
            <Plus size={16} /> Add Medicine
          </button>
        </div>
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(13, 124, 110, 0.08) 0%, rgba(34, 197, 94, 0.08) 100%)",
            border: "1.5px solid var(--color-primary, #0d7c6e)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "1rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 800,
                color: "var(--color-primary, #0d7c6e)",
                background: "#ffffff",
                padding: "2px 10px",
                borderRadius: "99px",
                border: "1px solid var(--color-primary, #0d7c6e)"
              }}
            >
              {selectedIds.length} Selected
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--color-text-secondary, #2f4847)", fontWeight: 600 }}>
              Bulk Inventory Operations
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid var(--color-border, #e2eceb)",
                background: "#ffffff",
                fontSize: "0.82rem",
                fontWeight: 700
              }}
            >
              <option value="add_stock">Add Stock (+ Qty)</option>
              <option value="reduce_stock">Reduce Stock (- Qty)</option>
              <option value="set_price">Set Unit Price (৳)</option>
              <option value="set_reorder_level">Set Reorder Threshold</option>
            </select>

            <input
              type="number"
              min="0"
              placeholder="Value..."
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              style={{
                width: "90px",
                padding: "6px 8px",
                borderRadius: "8px",
                border: "1px solid var(--color-border, #e2eceb)",
                background: "#ffffff",
                fontSize: "0.82rem"
              }}
            />

            <input
              type="text"
              placeholder="Audit reason..."
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              style={{
                width: "140px",
                padding: "6px 8px",
                borderRadius: "8px",
                border: "1px solid var(--color-border, #e2eceb)",
                background: "#ffffff",
                fontSize: "0.82rem"
              }}
            />

            <button
              type="button"
              disabled={bulkLoading}
              onClick={handleApplyBulkUpdate}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                background: "var(--color-primary, #0d7c6e)",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              {bulkLoading ? "Updating..." : "Apply"}
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                background: "transparent",
                border: "1px solid var(--color-border, #e2eceb)",
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div
        style={{
          overflowX: "auto",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid var(--color-border, #e2eceb)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
          <thead>
            <tr
              style={{
                background: "var(--color-surface-2, #f0f5f4)",
                color: "var(--color-text-secondary, #2f4847)",
                borderBottom: "1.5px solid var(--color-border, #e2eceb)",
                fontWeight: 700
              }}
            >
              <th style={{ padding: "0.95rem 0.8rem", width: "36px", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-primary, #0d7c6e)" }}
                >
                  {allFilteredSelected ? <CheckSquare size={17} /> : <Square size={17} />}
                </button>
              </th>
              <th style={{ padding: "0.95rem 1rem" }}>Medicine Name & Generic</th>
              <th style={{ padding: "0.95rem 1rem" }}>Category / Form</th>
              <th style={{ padding: "0.95rem 1rem" }}>Batch & Expiry</th>
              <th style={{ padding: "0.95rem 1rem" }}>Unit Price (৳)</th>
              <th style={{ padding: "0.95rem 1rem" }}>Stock & Availability</th>
              <th style={{ padding: "0.95rem 1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted, #47615f)" }}>
                  No inventory items match your search or filters.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const med = item.medicine_id || {};
                const isEditing = editingItemId === item._id;
                const isSelected = selectedIds.includes(item._id);
                const statusObj = getItemStatus(item);

                const expDateStr = item.expiry_date
                  ? new Date(item.expiry_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                  : "N/A";

                return (
                  <tr
                    key={item._id}
                    style={{
                      borderBottom: "1px solid var(--color-border, #e2eceb)",
                      background: isSelected ? "rgba(13, 124, 110, 0.04)" : "transparent",
                      transition: "background 0.15s ease"
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: "0.95rem 0.8rem", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleSelectOne(item._id)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-primary, #0d7c6e)" }}
                      >
                        {isSelected ? <CheckSquare size={17} /> : <Square size={17} />}
                      </button>
                    </td>

                    {/* Medicine Name */}
                    <td style={{ padding: "0.95rem 1rem" }}>
                      <div style={{ fontWeight: 800, color: "var(--color-text, #142422)", display: "flex", alignItems: "center", gap: "6px" }}>
                        {med.brand_name || "Unknown Medicine"}
                        {med.requires_prescription && (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              background: "rgba(220, 38, 38, 0.1)",
                              color: "#dc2626",
                              padding: "1px 6px",
                              borderRadius: "4px"
                            }}
                          >
                            Rx
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary, #2f4847)", marginTop: "0.15rem" }}>
                        {med.generic_name} {med.strength ? `(${med.strength})` : ""}
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "0.95rem 1rem", color: "var(--color-text-secondary, #2f4847)" }}>
                      <span style={{ fontWeight: 600 }}>{med.category || "General"}</span>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted, #47615f)" }}>
                        {med.dosage_form} • {item.unit || "Unit"}
                      </div>
                    </td>

                    {/* Batch & Expiry */}
                    <td style={{ padding: "0.95rem 1rem" }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text, #142422)" }}>
                        Batch: {item.batch_number || "BATCH-DEFAULT"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          marginTop: "2px",
                          color: statusObj.code === "EXPIRED" ? "#dc2626" : "var(--color-text-muted, #47615f)"
                        }}
                      >
                        Exp: {expDateStr}
                      </div>
                    </td>

                    {/* Price */}
                    <td style={{ padding: "0.95rem 1rem" }}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          style={{
                            width: "70px",
                            padding: "0.35rem",
                            borderRadius: "6px",
                            border: "1.5px solid var(--color-primary, #0d7c6e)",
                            background: "#ffffff",
                            color: "var(--color-text, #142422)",
                            fontWeight: 700
                          }}
                        />
                      ) : (
                        <span style={{ fontWeight: 800, color: "var(--color-primary, #0d7c6e)", fontSize: "0.95rem" }}>
                          ৳{item.unit_price ?? item.sellingPrice ?? 0}
                        </span>
                      )}
                    </td>

                    {/* Stock & Status */}
                    <td style={{ padding: "0.95rem 1rem" }}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          style={{
                            width: "70px",
                            padding: "0.35rem",
                            borderRadius: "6px",
                            border: "1.5px solid var(--color-primary, #0d7c6e)",
                            background: "#ffffff",
                            color: "var(--color-text, #142422)",
                            fontWeight: 700
                          }}
                        />
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              padding: "2px 8px",
                              borderRadius: "6px",
                              background: statusObj.bg,
                              color: statusObj.color,
                              width: "fit-content"
                            }}
                          >
                            {statusObj.code !== "IN_STOCK" && <AlertTriangle size={12} />}
                            {statusObj.label}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted, #47615f)" }}>
                            Reorder trigger: &lt; {item.reorder_level ?? 20}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.95rem 1rem", textAlign: "right" }}>
                      {isEditing ? (
                        <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                          <button
                            onClick={() => handleSaveEdit(item)}
                            style={{ background: "#0f8a3c", color: "#fff", border: "none", borderRadius: "6px", padding: "0.4rem 0.6rem", cursor: "pointer" }}
                          >
                            <Check size={15} />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            style={{ background: "var(--color-surface-2, #f0f5f4)", color: "var(--color-text-secondary, #2f4847)", border: "1px solid var(--color-border, #e2eceb)", borderRadius: "6px", padding: "0.4rem 0.6rem", cursor: "pointer" }}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                          <button
                            onClick={() => handleStartEdit(item)}
                            style={{ background: "var(--color-surface-2, #f0f5f4)", color: "var(--color-text-secondary, #2f4847)", border: "1px solid var(--color-border, #e2eceb)", borderRadius: "6px", padding: "0.4rem 0.6rem", cursor: "pointer" }}
                            title="Edit Price/Stock"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item._id)}
                            style={{ background: "rgba(201, 28, 28, 0.08)", color: "#c91c1c", border: "1px solid rgba(201, 28, 28, 0.2)", borderRadius: "6px", padding: "0.4rem 0.6rem", cursor: "pointer" }}
                            title="Remove from inventory"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── EXCEL IMPORT MODAL ─── */}
      {showImportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
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
              background: "#ffffff",
              border: "1px solid var(--color-border, #e2eceb)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(13,124,110,0.12)", color: "var(--color-primary, #0d7c6e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--color-text, #142422)" }}>
                    Import Medicine Inventory (.xlsx / .csv)
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--color-text-muted, #47615f)" }}>
                    Upload supplier catalog or bulk stock sheet with server-side schema verification.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview(null);
                  setImportFile(null);
                  setImportError("");
                }}
                style={{ background: "transparent", border: "none", color: "var(--color-text-muted, #47615f)", cursor: "pointer", padding: "0.2rem" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Step 1: Select File */}
            {!importPreview && (
              <form onSubmit={handleUploadPreview} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div
                  style={{
                    border: "2px dashed var(--color-border, #e2eceb)",
                    borderRadius: "12px",
                    padding: "2rem",
                    textAlign: "center",
                    background: "var(--color-surface-2, #f0f5f4)",
                    cursor: "pointer"
                  }}
                >
                  <Upload size={32} style={{ color: "var(--color-primary, #0d7c6e)", margin: "0 auto 10px" }} />
                  <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text, #142422)" }}>
                    {importFile ? importFile.name : "Select .xlsx, .xls, or .csv file"}
                  </p>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted, #47615f)" }}>
                    Max file size 10MB • Columns: Brand Name, Generic, Quantity, Price, Batch, Expiry
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    required
                    onChange={(e) => setImportFile(e.target.files[0])}
                    style={{ marginTop: "12px", display: "block", width: "100%", fontSize: "0.82rem" }}
                  />
                </div>

                {importError && (
                  <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#fee2e2", color: "#991b1b", fontSize: "0.82rem", fontWeight: 600 }}>
                    {importError}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const csvHeader = "Brand Name,Generic Name,Category,Strength,Quantity,Price,Batch Number,Expiry Date,Reorder Level\nNapa Extra,Paracetamol + Caffeine,Analgesic & Antipyretic,500mg,100,30,BATCH-2026,2026-12-31,20\nSeclo 20,Omeprazole,Gastrointestinal,20mg,200,70,SEC-99,2027-06-30,30";
                      const blob = new Blob([csvHeader], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "niramoy_inventory_sample_template.csv";
                      a.click();
                    }}
                    style={{ background: "transparent", border: "none", color: "var(--color-primary, #0d7c6e)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                  >
                    Download Sample Excel Template (.csv)
                  </button>

                  <button
                    type="submit"
                    disabled={importLoading || !importFile}
                    style={{
                      padding: "0.65rem 1.4rem",
                      borderRadius: "8px",
                      background: "var(--color-primary, #0d7c6e)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {importLoading ? "Validating Spreadsheet..." : "Upload & Validate"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Validation Preview */}
            {importPreview && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  <div style={{ padding: "12px", borderRadius: "10px", background: "var(--color-surface-2, #f0f5f4)", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-text, #142422)" }}>
                      {importPreview.totalRows}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted, #47615f)" }}>Total Rows</div>
                  </div>
                  <div style={{ padding: "12px", borderRadius: "10px", background: "#dcfce7", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#15803d" }}>
                      {importPreview.validCount}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#15803d" }}>Valid to Import</div>
                  </div>
                  <div style={{ padding: "12px", borderRadius: "10px", background: importPreview.errorCount > 0 ? "#fee2e2" : "var(--color-surface-2, #f0f5f4)", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: importPreview.errorCount > 0 ? "#b91c1c" : "var(--color-text-muted, #47615f)" }}>
                      {importPreview.errorCount}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: importPreview.errorCount > 0 ? "#b91c1c" : "var(--color-text-muted, #47615f)" }}>Validation Errors</div>
                  </div>
                </div>

                {/* Errors display if any */}
                {importPreview.errors && importPreview.errors.length > 0 && (
                  <div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#b91c1c", display: "block", marginBottom: "6px" }}>
                      Validation Error Log (Skipped Rows):
                    </span>
                    <div style={{ maxHeight: "140px", overflowY: "auto", border: "1px solid #fca5a5", borderRadius: "8px", background: "#fff1f2", padding: "8px" }}>
                      {importPreview.errors.map((err, idx) => (
                        <div key={idx} style={{ fontSize: "0.75rem", color: "#991b1b", marginBottom: "4px" }}>
                          Row {err.row}: {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valid Rows Preview Table */}
                <div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--color-text-secondary, #2f4847)", display: "block", marginBottom: "6px" }}>
                    Preview of Valid Records ({importPreview.previewRows?.length || 0} shown):
                  </span>
                  <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid var(--color-border, #e2eceb)", borderRadius: "8px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                      <thead style={{ background: "var(--color-surface-2, #f0f5f4)", fontWeight: 700 }}>
                        <tr>
                          <th style={{ padding: "6px 8px" }}>Medicine</th>
                          <th style={{ padding: "6px 8px" }}>Generic</th>
                          <th style={{ padding: "6px 8px" }}>Qty</th>
                          <th style={{ padding: "6px 8px" }}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(importPreview.previewRows || []).slice(0, 5).map((row, rIdx) => (
                          <tr key={rIdx} style={{ borderBottom: "1px solid var(--color-border, #e2eceb)" }}>
                            <td style={{ padding: "6px 8px", fontWeight: 700 }}>{row.brand_name}</td>
                            <td style={{ padding: "6px 8px" }}>{row.generic_name}</td>
                            <td style={{ padding: "6px 8px" }}>{row.quantity}</td>
                            <td style={{ padding: "6px 8px" }}>৳{row.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setImportPreview(null);
                      setImportFile(null);
                    }}
                    style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", background: "var(--color-surface-2, #f0f5f4)", border: "1px solid var(--color-border, #e2eceb)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    Select Another File
                  </button>

                  <button
                    type="button"
                    disabled={importLoading || importPreview.validCount === 0}
                    onClick={handleConfirmImport}
                    style={{
                      padding: "0.65rem 1.5rem",
                      borderRadius: "8px",
                      background: importPreview.validCount > 0 ? "var(--color-primary, #0d7c6e)" : "#94a3b8",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                  >
                    {importLoading ? "Writing to Database..." : `Confirm & Import (${importPreview.validCount} Items)`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── ADD MEDICINE MODAL ─── */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
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
              background: "#ffffff",
              border: "1px solid var(--color-border, #e2eceb)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text, #142422)" }}>
                Add Medicine to Inventory
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--color-text-muted, #47615f)", cursor: "pointer", padding: "0.2rem" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNew} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-secondary, #2f4847)", marginBottom: "0.35rem" }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Napa Extra, Seclo 20"
                  value={newItem.brand_name}
                  onChange={(e) => setNewItem({ ...newItem, brand_name: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1.5px solid var(--color-border, #e2eceb)", background: "#ffffff", color: "var(--color-text, #142422)", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-secondary, #2f4847)", marginBottom: "0.35rem" }}>
                  Generic Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol + Caffeine"
                  value={newItem.generic_name}
                  onChange={(e) => setNewItem({ ...newItem, generic_name: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1.5px solid var(--color-border, #e2eceb)", background: "#ffffff", color: "var(--color-text, #142422)", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-secondary, #2f4847)", marginBottom: "0.35rem" }}>
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1.5px solid var(--color-border, #e2eceb)", background: "#ffffff", color: "var(--color-text, #142422)", fontSize: "0.9rem" }}
                  >
                    <option>Analgesic & Antipyretic</option>
                    <option>Gastrointestinal</option>
                    <option>Antibiotic</option>
                    <option>Antihistamine</option>
                    <option>Vitamin & Mineral</option>
                    <option>Respiratory</option>
                    <option>Cardiovascular</option>
                    <option>Antidiabetic</option>
                    <option>Emergency & Critical</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-secondary, #2f4847)", marginBottom: "0.35rem" }}>
                    Strength
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={newItem.strength}
                    onChange={(e) => setNewItem({ ...newItem, strength: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1.5px solid var(--color-border, #e2eceb)", background: "#ffffff", color: "var(--color-text, #142422)", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-secondary, #2f4847)", marginBottom: "0.35rem" }}>
                    Unit Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="30"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1.5px solid var(--color-border, #e2eceb)", background: "#ffffff", color: "var(--color-text, #142422)", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-secondary, #2f4847)", marginBottom: "0.35rem" }}>
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="100"
                    value={newItem.stock_quantity}
                    onChange={(e) => setNewItem({ ...newItem, stock_quantity: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1.5px solid var(--color-border, #e2eceb)", background: "#ffffff", color: "var(--color-text, #142422)", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-secondary, #2f4847)", marginBottom: "0.35rem" }}>
                    Batch Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BATCH-2026-X"
                    value={newItem.batch_number}
                    onChange={(e) => setNewItem({ ...newItem, batch_number: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1.5px solid var(--color-border, #e2eceb)", background: "#ffffff", color: "var(--color-text, #142422)", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-secondary, #2f4847)", marginBottom: "0.35rem" }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newItem.expiry_date}
                    onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1.5px solid var(--color-border, #e2eceb)", background: "#ffffff", color: "var(--color-text, #142422)", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: "0.65rem 1.25rem", borderRadius: "8px", background: "var(--color-surface-2, #f0f5f4)", border: "1px solid var(--color-border, #e2eceb)", color: "var(--color-text-secondary, #2f4847)", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "0.65rem 1.5rem", borderRadius: "8px", background: "var(--color-primary, #0d7c6e)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(13, 124, 110, 0.25)" }}
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
