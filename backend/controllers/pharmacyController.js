const Pharmacy = require("../models/Pharmacy");
const PharmacyInventory = require("../models/PharmacyInventory");
const PharmacyOrder = require("../models/PharmacyOrder");
const Medicine = require("../models/Medicine");
const Prescription = require("../models/Prescription");
const InventoryAudit = require("../models/InventoryAudit");
const pharmacyExcelService = require("../services/pharmacyExcelService");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

// In-memory cache for validated import previews
const importBatchCache = new Map();

/**
 * Helper: Resolve authenticated pharmacy owner's pharmacy
 * Strictly derives identity from JWT req.user — never trusts client input
 */
async function resolveOwnerPharmacy(user) {
  if (!user) return null;
  const pId = user.pharmacy_id || user.pharmacyId;
  if (pId) {
    const p = await Pharmacy.findById(pId);
    if (p) return p;
  }
  const uId = user._id || user.id;
  let p = await Pharmacy.findOne({
    $or: [
      { owner_id: uId },
      { owner_user_id: uId },
      { ownerUserId: uId }
    ]
  });
  if (p) return p;
  if (user.role === "super_admin") {
    return Pharmacy.findOne({ $or: [{ is_active: true }, { active: true }] });
  }
  return null;
}

// GET /api/pharmacies
exports.getPharmacies = async (req, res, next) => {
  try {
    const {
      search,
      area,
      city = "Rajshahi",
      is_24_7,
      delivery_available,
      verified,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { is_active: true };
    if (city && city !== "all") filter.city = new RegExp(city, "i");
    if (area && area !== "All Areas") filter.area = new RegExp(area, "i");
    if (is_24_7 === "true") filter.is_24_7 = true;
    if (delivery_available === "true") filter.delivery_available = true;
    if (verified === "true") filter.is_verified = true;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { address: new RegExp(search, "i") },
        { area: new RegExp(search, "i") }
      ];
    }

    const total = await Pharmacy.countDocuments(filter);
    const pharmacies = await Pharmacy.find(filter)
      .select("-__v")
      .sort({ rating: -1, is_verified: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return paginatedResponse(res, pharmacies, total, page, limit, "Pharmacies retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacies/:id
exports.getPharmacyById = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).select("-__v").lean();
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", 404, "NOT_FOUND");

    const inventory = await PharmacyInventory.find({
      pharmacy_id: pharmacy._id,
      is_active: true
    })
      .populate("medicine_id")
      .sort({ in_stock: -1, "medicine_id.brand_name": 1 })
      .limit(500)
      .lean();

    return successResponse(res, { pharmacy, inventory }, "Pharmacy details fetched");
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacies/my-pharmacy
exports.getMyPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await resolveOwnerPharmacy(req.user);
    if (!pharmacy) {
      return errorResponse(res, "No pharmacy found linked to your account", 404, "NO_PHARMACY");
    }

    const inventory = await PharmacyInventory.find({
      pharmacy_id: pharmacy._id,
      is_active: true
    })
      .populate("medicine_id")
      .sort({ updatedAt: -1 })
      .limit(500)
      .lean();

    return successResponse(res, { pharmacy, inventory }, "Your pharmacy retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// POST /api/pharmacies
exports.createPharmacy = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.owner_id && req.user) {
      data.owner_id = req.user._id || req.user.id;
    }
    const pharmacy = await Pharmacy.create(data);
    return successResponse(res, pharmacy, "Pharmacy registered successfully", 201);
  } catch (err) {
    next(err);
  }
};

// PUT/PATCH /api/pharmacies/:id
exports.updatePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", 404);

    const isOwner = String(pharmacy.owner_id) === String(req.user._id || req.user.id);
    if (req.user.role !== "super_admin" && !isOwner) {
      return errorResponse(res, "You are not authorized to update this pharmacy", 403);
    }

    Object.assign(pharmacy, req.body);
    await pharmacy.save();

    return successResponse(res, pharmacy, "Pharmacy updated successfully");
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacies/:id/inventory
exports.getPharmacyInventory = async (req, res, next) => {
  try {
    const { in_stock, stock_status, category, search } = req.query;
    const filter = { pharmacy_id: req.params.id, is_active: true };

    if (in_stock === "true") filter.in_stock = true;
    if (stock_status && stock_status !== "all") filter.stock_status = stock_status;

    let inventory = await PharmacyInventory.find(filter)
      .populate("medicine_id")
      .sort({ in_stock: -1, updatedAt: -1 })
      .limit(500)
      .lean();

    if (category && category !== "All") {
      inventory = inventory.filter(
        item => item.medicine_id && item.medicine_id.category === category
      );
    }

    if (search) {
      const regex = new RegExp(search, "i");
      inventory = inventory.filter(
        item =>
          item.medicine_id &&
          (regex.test(item.medicine_id.brand_name) ||
            regex.test(item.medicine_id.generic_name) ||
            regex.test(item.medicine_id.manufacturer))
      );
    }

    return successResponse(res, inventory, "Inventory retrieved");
  } catch (err) {
    next(err);
  }
};

// POST /api/pharmacies/:id/inventory
exports.addInventoryItem = async (req, res, next) => {
  try {
    const {
      medicine_id,
      brand_name,
      generic_name,
      category,
      dosage_form,
      strength,
      manufacturer,
      stock_quantity,
      unit_price,
      batch_number,
      expiry_date,
      reorder_level
    } = req.body;

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", 404);

    const isOwner = String(pharmacy.owner_id) === String(req.user._id || req.user.id);
    if (req.user.role !== "super_admin" && !isOwner && req.user.role !== "pharmacist") {
      return errorResponse(res, "Not authorized to modify this inventory", 403);
    }

    let targetMedId = medicine_id;

    // If new medicine details passed without existing ID, find or create in master catalog
    if (!targetMedId && brand_name) {
      let med = await Medicine.findOne({
        brand_name: new RegExp(`^${brand_name.trim()}$`, "i"),
        strength: strength ? new RegExp(`^${strength.trim()}$`, "i") : undefined
      });

      if (!med) {
        med = await Medicine.create({
          brand_name: brand_name.trim(),
          generic_name: (generic_name || brand_name).trim(),
          category: category || "Analgesic & Antipyretic",
          dosage_form: dosage_form || "Tablet",
          strength: strength || "500mg",
          manufacturer: manufacturer || "General Pharma",
          unit_price: Number(unit_price) || 10,
          is_active: true
        });
      }
      targetMedId = med._id;
    }

    if (!targetMedId) {
      return errorResponse(res, "Medicine ID or Brand Name is required", 422);
    }

    const previousItem = await PharmacyInventory.findOne({ pharmacy_id: pharmacy._id, medicine_id: targetMedId });
    const prevQty = previousItem ? previousItem.stock_quantity : 0;
    const newQty = Number(stock_quantity) || 0;

    const item = await PharmacyInventory.findOneAndUpdate(
      { pharmacy_id: pharmacy._id, medicine_id: targetMedId },
      {
        stock_quantity: newQty,
        unit_price: Number(unit_price),
        batch_number: batch_number || "",
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        reorder_level: Number(reorder_level) || 20,
        last_updated_by: req.user._id || req.user.id,
        is_active: true
      },
      { upsert: true, new: true, runValidators: true }
    ).populate("medicine_id");

    // Record stock audit
    await InventoryAudit.create({
      pharmacyId: pharmacy._id,
      medicineId: targetMedId,
      userId: req.user._id || req.user.id,
      action: previousItem ? "STOCK_UPDATED" : "STOCK_ADDED",
      previousQuantity: prevQty,
      newQuantity: newQty,
      batchNumber: batch_number || "",
      reason: previousItem ? "Manual inventory update" : "New medicine added to inventory"
    });

    return successResponse(res, item, "Inventory updated successfully");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/pharmacies/:id/inventory/:itemId
exports.deleteInventoryItem = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", 404);

    const isOwner = String(pharmacy.owner_id) === String(req.user._id || req.user.id);
    if (req.user.role !== "super_admin" && !isOwner) {
      return errorResponse(res, "Not authorized to modify this inventory", 403);
    }

    const item = await PharmacyInventory.findById(req.params.itemId);
    if (item) {
      await InventoryAudit.create({
        pharmacyId: pharmacy._id,
        medicineId: item.medicine_id,
        userId: req.user._id || req.user.id,
        action: "STOCK_REMOVED",
        previousQuantity: item.stock_quantity,
        newQuantity: 0,
        reason: "Item removed from active pharmacy inventory"
      });

      item.is_active = false;
      item.in_stock = false;
      item.stock_quantity = 0;
      await item.save();
    }

    return successResponse(res, null, "Item removed from inventory");
  } catch (err) {
    next(err);
  }
};

// ─── Phase 11: Excel Import & Export ──────────────────────────────────────────

/**
 * POST /api/pharmacy/import/preview
 * Upload and parse Excel/CSV with row-by-row validation & error reporting
 */
exports.importExcelPreview = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return errorResponse(res, "No file uploaded. Please upload a .xlsx, .xls, or .csv spreadsheet.", 422);
    }

    const pharmacy = await resolveOwnerPharmacy(req.user);
    if (!pharmacy) {
      return errorResponse(res, "No pharmacy linked to your account", 403);
    }

    const result = await pharmacyExcelService.parseAndValidate(req.file.buffer, req.file.originalname);
    const importBatchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    importBatchCache.set(importBatchId, result.validRows);
    result.importBatchId = importBatchId;
    return successResponse(res, result, "Spreadsheet validated. Review preview before confirmation.");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/pharmacy/import/confirm
 * Owner confirms import of validated rows
 */
exports.confirmExcelImport = async (req, res, next) => {
  try {
    let rows = req.body.rows || req.body.validRows;
    if ((!rows || rows.length === 0) && req.body.importBatchId) {
      rows = importBatchCache.get(req.body.importBatchId);
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return errorResponse(res, "No validated rows supplied for import", 422);
    }

    const pharmacy = await resolveOwnerPharmacy(req.user);
    if (!pharmacy) {
      return errorResponse(res, "No pharmacy linked to your account", 403);
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      const bName = row.brandName || row.brand_name || "";
      const gName = row.genericName || row.generic_name || bName;
      const mfg = row.manufacturer || "Healthcare Pharmaceuticals";
      const cat = row.category || "Analgesic & Antipyretic";
      const dForm = row.dosageForm || row.dosage_form || "Tablet";
      const str = row.strength || "500mg";
      const price = Number(row.unitPrice || row.price || row.unit_price) || 10;
      const qty = Number(row.quantity || row.stock_quantity) || 0;
      const bNum = row.batchNumber || row.batch_number || "";
      const exp = row.expiryDate || row.expiry_date;
      const reorder = Number(row.reorderLevel || row.reorder_level) || 20;
      const reqRx = Boolean(row.requiresPrescription || row.requires_prescription);

      if (!bName) continue;

      // Find or create global medicine catalog entry
      let med = await Medicine.findOne({
        brand_name: new RegExp(`^${bName.trim()}$`, "i"),
        strength: str ? new RegExp(`^${str.trim()}$`, "i") : undefined
      });

      if (!med) {
        med = await Medicine.create({
          brand_name: bName.trim(),
          generic_name: gName.trim(),
          manufacturer: mfg,
          category: cat,
          dosage_form: dForm,
          strength: str,
          unit_price: price,
          requires_prescription: reqRx,
          is_active: true
        });
      }

      const existingInv = await PharmacyInventory.findOne({
        $or: [{ pharmacy_id: pharmacy._id }, { pharmacyId: pharmacy._id }],
        $and: [{ $or: [{ medicine_id: med._id }, { medicineId: med._id }] }]
      });

      const prevQty = existingInv ? existingInv.stock_quantity : 0;

      await PharmacyInventory.findOneAndUpdate(
        { pharmacy_id: pharmacy._id, medicine_id: med._id },
        {
          pharmacy_id: pharmacy._id,
          pharmacyId: pharmacy._id,
          medicine_id: med._id,
          medicineId: med._id,
          stock_quantity: qty,
          quantity: qty,
          unit_price: price,
          sellingPrice: price,
          batch_number: bNum,
          batchNumber: bNum,
          expiry_date: exp ? new Date(exp) : null,
          expiryDate: exp ? new Date(exp) : null,
          reorder_level: reorder,
          reorderLevel: reorder,
          last_updated_by: req.user._id || req.user.id,
          is_active: true
        },
        { upsert: true, new: true, runValidators: true }
      );

      await InventoryAudit.create({
        pharmacyId: pharmacy._id,
        pharmacy_id: pharmacy._id,
        medicineId: med._id,
        medicine_id: med._id,
        userId: req.user._id || req.user.id,
        action: "EXCEL_IMPORT",
        previousQuantity: prevQty,
        newQuantity: qty,
        batchNumber: bNum,
        reason: `Excel Import: ${bName} (${qty} units)`
      });

      if (existingInv) updatedCount++;
      else insertedCount++;
    }

    return successResponse(res, {
      totalProcessed: rows.length,
      insertedCount,
      updatedCount
    }, `Successfully imported ${rows.length} medicines into ${pharmacy.name}`);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/pharmacy/export
 * Download isolated Excel inventory (.xlsx)
 */
exports.exportExcel = async (req, res, next) => {
  try {
    const pharmacy = await resolveOwnerPharmacy(req.user);
    if (!pharmacy) return errorResponse(res, "No pharmacy linked to your account", 403);

    const { filter = "all", category } = req.query;
    const query = { pharmacy_id: pharmacy._id, is_active: true };

    const items = await PharmacyInventory.find(query).populate("medicine_id");

    const now = new Date();
    let filteredItems = items;

    if (filter === "in_stock") {
      filteredItems = items.filter(i => (i.stock_quantity - (i.reserved_quantity || 0)) > 0);
    } else if (filter === "low_stock") {
      filteredItems = items.filter(i => {
        const avail = i.stock_quantity - (i.reserved_quantity || 0);
        return avail > 0 && avail <= (i.reorder_level || 20);
      });
    } else if (filter === "out_of_stock") {
      filteredItems = items.filter(i => (i.stock_quantity - (i.reserved_quantity || 0)) <= 0);
    } else if (filter === "expiring_soon") {
      const in90Days = new Date(Date.now() + 90 * 86400000);
      filteredItems = items.filter(i => i.expiry_date && new Date(i.expiry_date) <= in90Days);
    }

    if (category && category !== "All") {
      filteredItems = filteredItems.filter(i => i.medicine_id && i.medicine_id.category === category);
    }

    const excelBuffer = pharmacyExcelService.exportInventoryToExcel(filteredItems, pharmacy.name);
    const dateTag = new Date().toISOString().slice(0, 10);
    const filename = `pharmacy-inventory-${dateTag}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", excelBuffer.length);

    return res.end(excelBuffer);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/pharmacy/inventory/bulk-update
 */
exports.bulkUpdateStock = async (req, res, next) => {
  try {
    const { updates } = req.body; // Array of { inventoryId, quantity, unitPrice, reason }
    if (!Array.isArray(updates) || updates.length === 0) {
      return errorResponse(res, "Updates array is required", 422);
    }

    const pharmacy = await resolveOwnerPharmacy(req.user);
    if (!pharmacy) return errorResponse(res, "No pharmacy linked to your account", 403);

    let updatedCount = 0;
    for (const up of updates) {
      const item = await PharmacyInventory.findOne({ _id: up.inventoryId, pharmacy_id: pharmacy._id });
      if (item) {
        const prevQty = item.stock_quantity;
        const newQty = up.quantity !== undefined ? Number(up.quantity) : prevQty;

        if (up.quantity !== undefined) item.stock_quantity = newQty;
        if (up.unitPrice !== undefined) item.unit_price = Number(up.unitPrice);
        item.last_updated_by = req.user._id || req.user.id;
        await item.save();

        await InventoryAudit.create({
          pharmacyId: pharmacy._id,
          medicineId: item.medicine_id,
          userId: req.user._id || req.user.id,
          action: "STOCK_UPDATED",
          previousQuantity: prevQty,
          newQuantity: newQty,
          reason: up.reason || "Bulk Stock Update"
        });

        updatedCount++;
      }
    }

    return successResponse(res, { updatedCount }, `Bulk stock updated for ${updatedCount} medicines`);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/pharmacy/analytics
 * Owner Dashboard Analytics with Expiry, Low Stock, and Orders Breakdown
 */
exports.getPharmacyAnalytics = async (req, res, next) => {
  try {
    const pharmacy = await resolveOwnerPharmacy(req.user);
    if (!pharmacy) return errorResponse(res, "No pharmacy linked to your account", 403);

    const inventory = await PharmacyInventory.find({ pharmacy_id: pharmacy._id, is_active: true }).populate("medicine_id");

    const now = new Date();
    const in7Days = new Date(Date.now() + 7 * 86400000);
    const in30Days = new Date(Date.now() + 30 * 86400000);
    const in90Days = new Date(Date.now() + 90 * 86400000);

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let expired = 0;
    let expires7Days = 0;
    let expires30Days = 0;
    let expires90Days = 0;

    const categoryMap = {};

    for (const item of inventory) {
      const avail = Math.max(0, item.stock_quantity - (item.reserved_quantity || 0));
      const exp = item.expiry_date ? new Date(item.expiry_date) : null;

      if (exp && exp < now) {
        expired++;
      } else if (avail <= 0) {
        outOfStock++;
      } else if (avail <= (item.reorder_level || 20)) {
        lowStock++;
        inStock++;
      } else {
        inStock++;
      }

      if (exp && exp >= now) {
        if (exp <= in7Days) expires7Days++;
        if (exp <= in30Days) expires30Days++;
        if (exp <= in90Days) expires90Days++;
      }

      const cat = item.medicine_id?.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    }

    // Orders summary
    const orders = await PharmacyOrder.find({ pharmacy_id: pharmacy._id });
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const confirmedOrders = orders.filter(o => o.status === "confirmed" || o.status === "preparing").length;
    const completedOrders = orders.filter(o => o.status === "delivered").length;
    const totalRevenue = orders.filter(o => o.payment_status === "paid").reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return successResponse(res, {
      pharmacy: {
        _id: pharmacy._id,
        name: pharmacy.name,
        area: pharmacy.area,
        address: pharmacy.address,
        is_24_7: pharmacy.is_24_7,
        delivery_available: pharmacy.delivery_available
      },
      stats: {
        totalMedicines: inventory.length,
        inStock,
        lowStock,
        outOfStock,
        expired,
        expires7Days,
        expires30Days,
        expires90Days,
        totalOrders: orders.length,
        pendingOrders,
        confirmedOrders,
        completedOrders,
        totalRevenue
      },
      categoryDistribution: Object.entries(categoryMap).map(([name, count]) => ({ name, count }))
    }, "Pharmacy analytics fetched");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/pharmacies/availability/by-prescription/:id
 * Connects doctor prescription with real pharmacy stock in Rajshahi
 */
exports.checkPrescriptionAvailability = async (req, res, next) => {
  try {
    let prescription = null;
    if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      prescription = await Prescription.findById(req.params.id).lean();
    }
    if (!prescription && req.params.id) {
      prescription = await Prescription.findOne({ prescription_number: req.params.id }).lean();
    }
    if (!prescription) {
      return errorResponse(res, "Prescription not found", 404, "NOT_FOUND");
    }

    const medNames = (prescription.medicines || []).map(m => (m.medicine_name || m.name || "").trim().toLowerCase());
    if (medNames.length === 0) {
      return successResponse(res, { matches: [], pharmacies: [] }, "No medicines found on prescription");
    }

    // Find all medicines matching the names
    const regexps = medNames.map(name => new RegExp(name, 'i'));
    const matchedMedicines = await Medicine.find({
      $or: [
        { brand_name: { $in: regexps } },
        { generic_name: { $in: regexps } }
      ]
    }).select('_id brand_name generic_name').lean();

    const matchedMedicineIds = matchedMedicines.map(m => m._id);

    // Find inventory for these specific medicines only
    const inventoryItems = await PharmacyInventory.find({
      medicine_id: { $in: matchedMedicineIds },
      $or: [{ in_stock: true }, { stock_quantity: { $gt: 0 } }],
      is_active: true
    }).populate('pharmacy_id').populate('medicine_id').lean();

    const pharmacyMap = new Map();

    for (const inv of inventoryItems) {
      const ph = inv.pharmacy_id;
      if (!ph || (!ph.is_active && !ph.active)) continue;
      
      const phId = ph._id.toString();
      if (!pharmacyMap.has(phId)) {
        pharmacyMap.set(phId, {
          pharmacy: ph,
          availableItems: []
        });
      }
      
      const pData = pharmacyMap.get(phId);
      
      // Check which prescribed medicine this matches
      const medNameLower = inv.medicine_id.brand_name.toLowerCase();
      const rxMed = prescription.medicines.find(rm => 
        medNameLower.includes((rm.medicine_name || '').toLowerCase()) || 
        ((rm.medicine_name || '').toLowerCase()).includes(medNameLower)
      );

      if (rxMed) {
        // Prevent duplicate push for same medicine in same pharmacy
        if (!pData.availableItems.find(i => i.prescribedName === rxMed.medicine_name)) {
          pData.availableItems.push({
            prescribedName: rxMed.medicine_name,
            matchedBrand: inv.medicine_id.brand_name,
            unitPrice: inv.unit_price,
            availableStock: inv.stock_quantity
          });
        }
      }
    }

    const matches = [];
    for (const [phId, data] of pharmacyMap.entries()) {
      const missingItems = prescription.medicines
        .map(rm => rm.medicine_name)
        .filter(name => !data.availableItems.find(i => i.prescribedName === name));
        
      const matchRatio = data.availableItems.length / prescription.medicines.length;
      
      matches.push({
        pharmacy: {
          _id: data.pharmacy._id,
          name: data.pharmacy.name,
          area: data.pharmacy.area,
          address: data.pharmacy.address,
          phone: data.pharmacy.phone,
          rating: data.pharmacy.rating,
          is_24_7: data.pharmacy.is_24_7,
          delivery_available: data.pharmacy.delivery_available,
          delivery_fee: data.pharmacy.delivery_fee,
          delivery_eta_mins: data.pharmacy.delivery_eta_mins
        },
        matchRatio,
        matchPercentage: Math.round(matchRatio * 100),
        availableCount: data.availableItems.length,
        totalPrescribed: prescription.medicines.length,
        availableItems: data.availableItems,
        missingItems
      });
    }

    // Sort by match percentage desc, delivery availability, rating desc
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage || (b.pharmacy.delivery_available ? 1 : 0) - (a.pharmacy.delivery_available ? 1 : 0));

    return successResponse(res, {
      prescriptionId: prescription._id,
      prescriptionNumber: prescription.prescription_number,
      totalPrescribed: prescription.medicines.length,
      matchingPharmaciesCount: matches.length,
      pharmacies: matches
    }, "Prescription availability computed across Rajshahi");
  } catch (err) {
    next(err);
  }
};
