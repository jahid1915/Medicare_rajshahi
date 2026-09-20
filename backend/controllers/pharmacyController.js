const Pharmacy = require("../models/Pharmacy");
const PharmacyInventory = require("../models/PharmacyInventory");
const Medicine = require("../models/Medicine");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

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
      .limit(parseInt(limit));

    return paginatedResponse(res, pharmacies, total, page, limit, "Pharmacies retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacies/:id
exports.getPharmacyById = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).select("-__v");
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", 404, "NOT_FOUND");

    // Fetch inventory
    const inventory = await PharmacyInventory.find({
      pharmacy_id: pharmacy._id,
      is_active: true
    })
      .populate("medicine_id")
      .sort({ in_stock: -1, "medicine_id.brand_name": 1 });

    return successResponse(res, { pharmacy, inventory }, "Pharmacy details fetched");
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacies/my-pharmacy
exports.getMyPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner_id: req.user._id, is_active: true });
    if (!pharmacy) {
      return errorResponse(res, "No pharmacy found linked to your account", 404, "NO_PHARMACY");
    }

    const inventory = await PharmacyInventory.find({
      pharmacy_id: pharmacy._id,
      is_active: true
    })
      .populate("medicine_id")
      .sort({ updatedAt: -1 });

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
      data.owner_id = req.user._id;
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

    // Permission check
    if (
      req.user.role !== "super_admin" &&
      String(pharmacy.owner_id) !== String(req.user._id)
    ) {
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
    const { in_stock, category, search } = req.query;
    const filter = { pharmacy_id: req.params.id, is_active: true };
    if (in_stock === "true") filter.in_stock = true;

    let inventory = await PharmacyInventory.find(filter)
      .populate("medicine_id")
      .sort({ in_stock: -1, updatedAt: -1 });

    if (category) {
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
    const { medicine_id, stock_quantity, unit_price, batch_number, expiry_date, reorder_level } = req.body;

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", 404);

    if (
      req.user.role !== "super_admin" &&
      String(pharmacy.owner_id) !== String(req.user._id) &&
      req.user.role !== "pharmacist"
    ) {
      return errorResponse(res, "Not authorized to modify this inventory", 403);
    }

    const item = await PharmacyInventory.findOneAndUpdate(
      { pharmacy_id: pharmacy._id, medicine_id },
      {
        stock_quantity,
        unit_price,
        batch_number,
        expiry_date,
        reorder_level: reorder_level || 20,
        in_stock: stock_quantity > 0,
        is_active: true
      },
      { upsert: true, new: true, runValidators: true }
    ).populate("medicine_id");

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

    if (
      req.user.role !== "super_admin" &&
      String(pharmacy.owner_id) !== String(req.user._id)
    ) {
      return errorResponse(res, "Not authorized to modify this inventory", 403);
    }

    await PharmacyInventory.findByIdAndUpdate(req.params.itemId, { is_active: false, in_stock: false });
    return successResponse(res, null, "Item removed from inventory");
  } catch (err) {
    next(err);
  }
};
