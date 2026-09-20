const Medicine = require("../models/Medicine");
const PharmacyInventory = require("../models/PharmacyInventory");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

// GET /api/medicines
exports.getMedicines = async (req, res, next) => {
  try {
    const {
      search,
      category,
      generic,
      manufacturer,
      requires_prescription,
      page = 1,
      limit = 24
    } = req.query;

    const filter = { is_active: true };

    if (category && category !== "All") {
      filter.category = category;
    }
    if (generic) {
      filter.generic_name = new RegExp(generic, "i");
    }
    if (manufacturer && manufacturer !== "All") {
      filter.manufacturer = new RegExp(manufacturer, "i");
    }
    if (requires_prescription !== undefined) {
      filter.requires_prescription = requires_prescription === "true";
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { brand_name: regex },
        { generic_name: regex },
        { manufacturer: regex },
        { category: regex }
      ];
    }

    const total = await Medicine.countDocuments(filter);
    const medicines = await Medicine.find(filter)
      .select("-__v")
      .sort({ brand_name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, medicines, total, page, limit, "Medicines retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// GET /api/medicines/:id
exports.getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id).select("-__v");
    if (!medicine) return errorResponse(res, "Medicine not found", 404, "NOT_FOUND");

    // Also find all pharmacies in Rajshahi stocking this medicine
    const availablePharmacies = await PharmacyInventory.find({
      medicine_id: medicine._id,
      is_active: true,
      in_stock: true
    })
      .populate("pharmacy_id", "name address area city phone rating is_24_7 delivery_available delivery_fee delivery_eta_mins")
      .sort({ unit_price: 1 });

    return successResponse(res, { medicine, availablePharmacies }, "Medicine details with pharmacy availability");
  } catch (err) {
    next(err);
  }
};

// GET /api/medicines/meta/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Medicine.distinct("category", { is_active: true });
    const manufacturers = await Medicine.distinct("manufacturer", { is_active: true });
    return successResponse(res, { categories, manufacturers }, "Metadata retrieved");
  } catch (err) {
    next(err);
  }
};

// POST /api/medicines
exports.createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);
    return successResponse(res, medicine, "Medicine created successfully", 201);
  } catch (err) {
    next(err);
  }
};
