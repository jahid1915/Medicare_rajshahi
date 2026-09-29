const XLSX = require("xlsx");
const Medicine = require("../models/Medicine");

/**
 * Pharmacy Excel Import & Export Service
 */
class PharmacyExcelService {
  /**
   * Parse and validate uploaded Excel/CSV file buffer
   * Returns: { validRows, invalidRows, summary }
   */
  async parseAndValidate(buffer, originalname = "upload.xlsx") {
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error("Uploaded workbook contains no sheets");
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rawRows || rawRows.length === 0) {
      throw new Error("Spreadsheet is empty. Please provide medicine rows.");
    }

    if (rawRows.length > 2000) {
      throw new Error("File exceeds maximum allowed 2,000 rows limit.");
    }

    const validRows = [];
    const invalidRows = [];
    const seenItems = new Set();

    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const rowNum = index + 2; // Accounting for 1-indexed sheet + header row
      const errors = [];

      // Flexible column key extraction (case-insensitive & whitespace trimmed)
      const getCol = (possibleKeys) => {
        for (const key of Object.keys(row)) {
          const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
          for (const p of possibleKeys) {
            if (normalized === p.toLowerCase().replace(/[^a-z0-9]/g, "")) {
              return String(row[key]).trim();
            }
          }
        }
        return "";
      };

      const brandName = getCol(["Brand Name", "Medicine Name", "Brand", "Name"]);
      const genericName = getCol(["Generic Name", "Generic", "Molecule"]);
      const manufacturer = getCol(["Manufacturer", "Company", "Brand Manufacturer"]) || "Healthcare Pharmaceuticals";
      const category = getCol(["Category", "Therapeutic Class"]) || "Analgesic & Antipyretic";
      const strength = getCol(["Strength", "Dose"]) || "500mg";
      const dosageForm = getCol(["Dosage Form", "Form", "Type"]) || "Tablet";
      const rawQty = getCol(["Quantity", "Stock", "Qty", "Stock Quantity"]);
      const rawPrice = getCol(["Price", "Unit Price", "Selling Price", "Rate"]);
      const batchNumber = getCol(["Batch Number", "Batch", "Batch No"]) || `B-${Date.now().toString(36).toUpperCase()}`;
      const rawExpiry = getCol(["Expiry Date", "Expiry", "Exp Date", "Exp"]);
      const rawReorder = getCol(["Reorder Level", "Reorder", "Min Stock"]) || "20";
      const rawRx = getCol(["Prescription Required", "Rx Required", "Prescription"]);

      // 1. Validate Brand Name
      if (!brandName) {
        errors.push("Brand Name is required.");
      }

      // 2. Validate Quantity
      const quantity = parseInt(rawQty, 10);
      if (rawQty === "" || isNaN(quantity)) {
        errors.push("Quantity must be a valid whole number.");
      } else if (quantity < 0) {
        errors.push("Quantity cannot be negative.");
      }

      // 3. Validate Price
      const price = parseFloat(rawPrice);
      if (rawPrice === "" || isNaN(price)) {
        errors.push("Unit Price must be a valid number.");
      } else if (price <= 0) {
        errors.push("Unit Price must be greater than zero.");
      }

      // 4. Validate Expiry Date
      let parsedExpiry = null;
      if (rawExpiry) {
        const d = new Date(rawExpiry);
        if (isNaN(d.getTime())) {
          errors.push(`Expiry date '${rawExpiry}' is not a valid date format (Use YYYY-MM-DD).`);
        } else {
          parsedExpiry = d;
          if (d < new Date()) {
            errors.push(`Expiry date (${d.toISOString().slice(0, 10)}) is in the past (expired medicine).`);
          }
        }
      }

      // 5. Detect duplicate rows inside the same file
      const dedupeKey = `${(brandName || "").toLowerCase()}_${(strength || "").toLowerCase()}_${(batchNumber || "").toLowerCase()}`;
      if (brandName && seenItems.has(dedupeKey)) {
        errors.push(`Duplicate item in spreadsheet: '${brandName}' (${strength}, Batch ${batchNumber}).`);
      } else if (brandName) {
        seenItems.add(dedupeKey);
      }

      const reorderLevel = Math.max(0, parseInt(rawReorder, 10) || 20);
      const requiresPrescription = ["yes", "true", "1", "required"].includes((rawRx || "").toLowerCase());

      const parsedRow = {
        rowNumber: rowNum,
        brandName,
        genericName: genericName || brandName,
        manufacturer,
        category,
        strength,
        dosageForm,
        quantity: isNaN(quantity) ? 0 : quantity,
        unitPrice: isNaN(price) ? 0 : price,
        batchNumber,
        expiryDate: parsedExpiry,
        reorderLevel,
        requiresPrescription
      };

      if (errors.length > 0) {
        invalidRows.push({
          rowNumber: rowNum,
          brandName: brandName || "(Missing)",
          errors,
          rawData: row
        });
      } else {
        validRows.push(parsedRow);
      }
    }

    return {
      fileName: originalname,
      totalRows: rawRows.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      errorCount: invalidRows.length,
      validRows,
      invalidRows,
      errors: invalidRows.map(r => ({ row: r.rowNumber, error: (r.errors || []).join("; ") })),
      previewRows: validRows
    };
  }

  /**
   * Export Pharmacy Inventory items to styled Excel Buffer
   */
  exportInventoryToExcel(inventoryItems, pharmacyName = "Pharmacy") {
    const rows = inventoryItems.map((item, idx) => {
      const med = item.medicine_id || {};
      const expDate = item.expiry_date ? new Date(item.expiry_date).toISOString().slice(0, 10) : "N/A";
      const available = Math.max(0, (item.stock_quantity || 0) - (item.reserved_quantity || 0));

      let status = "IN STOCK";
      if (item.expiry_date && new Date(item.expiry_date) < new Date()) {
        status = "EXPIRED";
      } else if (available <= 0) {
        status = "OUT OF STOCK";
      } else if (available <= (item.reorder_level || 20)) {
        status = "LOW STOCK";
      }

      return {
        "SL": idx + 1,
        "Brand Name": med.brand_name || "N/A",
        "Generic Name": med.generic_name || "N/A",
        "Category": med.category || "General",
        "Manufacturer": med.manufacturer || "N/A",
        "Strength": med.strength || "N/A",
        "Dosage Form": med.dosage_form || "Tablet",
        "Total Quantity": item.stock_quantity || 0,
        "Available Quantity": available,
        "Unit Price (BDT)": item.unit_price || 0,
        "Batch Number": item.batch_number || "N/A",
        "Expiry Date": expDate,
        "Reorder Level": item.reorder_level || 20,
        "Prescription Required": med.requires_prescription ? "Yes" : "No",
        "Stock Status": status,
        "Last Updated": item.updatedAt ? new Date(item.updatedAt).toISOString().slice(0, 10) : "N/A"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-fit column widths
    const colWidths = [
      { wch: 5 },  // SL
      { wch: 22 }, // Brand
      { wch: 24 }, // Generic
      { wch: 20 }, // Category
      { wch: 24 }, // Manufacturer
      { wch: 12 }, // Strength
      { wch: 12 }, // Dosage Form
      { wch: 14 }, // Total Qty
      { wch: 16 }, // Avail Qty
      { wch: 16 }, // Price
      { wch: 14 }, // Batch
      { wch: 14 }, // Expiry
      { wch: 14 }, // Reorder
      { wch: 18 }, // Rx
      { wch: 14 }, // Status
      { wch: 14 }  // Updated
    ];
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return excelBuffer;
  }
}

module.exports = new PharmacyExcelService();
