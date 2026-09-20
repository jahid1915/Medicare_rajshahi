const PharmacyOrder = require("../models/PharmacyOrder");
const Pharmacy = require("../models/Pharmacy");
const PharmacyInventory = require("../models/PharmacyInventory");
const Medicine = require("../models/Medicine");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

// POST /api/pharmacy-orders
exports.createOrder = async (req, res, next) => {
  try {
    const {
      pharmacy_id,
      items,
      delivery_address,
      delivery_type = "home_delivery",
      payment_method = "cash_on_delivery",
      prescription_id,
      prescription_image,
      notes
    } = req.body;

    if (!pharmacy_id) return errorResponse(res, "Pharmacy ID is required", 400);
    if (!items || !items.length) return errorResponse(res, "Order must contain at least one item", 400);
    if (!delivery_address || !delivery_address.recipient_name || !delivery_address.phone || !delivery_address.street) {
      return errorResponse(res, "Complete delivery address (name, phone, street) is required", 400);
    }

    const pharmacy = await Pharmacy.findById(pharmacy_id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", 404);

    let subtotal = 0;
    let requiresPrescription = false;
    const orderItems = [];

    // Verify each item and check prescription requirement
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine_id);
      if (!medicine) {
        return errorResponse(res, `Medicine not found for ID: ${item.medicine_id}`, 404);
      }

      if (medicine.requires_prescription) {
        requiresPrescription = true;
      }

      const itemTotal = Number(item.unit_price) * Number(item.quantity);
      subtotal += itemTotal;

      orderItems.push({
        medicine_id: medicine._id,
        brand_name: medicine.brand_name,
        generic_name: medicine.generic_name,
        dosage_form: medicine.dosage_form,
        strength: medicine.strength,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: itemTotal
      });
    }

    // Delivery fee logic
    let deliveryFee = delivery_type === "pickup" ? 0 : pharmacy.delivery_fee || 40;
    if (subtotal >= (pharmacy.free_delivery_above || 500) && delivery_type === "home_delivery") {
      deliveryFee = 0;
    }

    const totalAmount = subtotal + deliveryFee;

    const order = await PharmacyOrder.create({
      patient_id: req.user._id,
      pharmacy_id: pharmacy._id,
      items: orderItems,
      prescription_id: prescription_id || null,
      prescription_required: requiresPrescription,
      prescription_image: prescription_image || null,
      prescription_verified: false,
      subtotal,
      delivery_fee: deliveryFee,
      discount: 0,
      total_amount: totalAmount,
      delivery_address,
      delivery_type,
      payment_method,
      payment_status: "pending",
      status: "pending",
      notes: notes || "",
      timeline: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order placed successfully by patient"
        }
      ]
    });

    // Reduce inventory stock quantity
    for (const item of items) {
      await PharmacyInventory.findOneAndUpdate(
        { pharmacy_id: pharmacy._id, medicine_id: item.medicine_id },
        { $inc: { stock_quantity: -item.quantity } }
      );
    }

    return successResponse(res, order, "Order placed successfully", 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacy-orders/my-orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { patient_id: req.user._id };
    if (status && status !== "all") filter.status = status;

    const total = await PharmacyOrder.countDocuments(filter);
    const orders = await PharmacyOrder.find(filter)
      .populate("pharmacy_id", "name address phone area")
      .populate("prescription_id", "prescription_number doctor_name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, orders, total, page, limit, "Your orders fetched");
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacy-orders/pharmacy/:pharmacyId
exports.getPharmacyOrders = async (req, res, next) => {
  try {
    const { pharmacyId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", 404);

    if (
      req.user.role !== "super_admin" &&
      String(pharmacy.owner_id) !== String(req.user._id) &&
      req.user.role !== "pharmacist"
    ) {
      return errorResponse(res, "Not authorized to view these orders", 403);
    }

    const filter = { pharmacy_id: pharmacyId };
    if (status && status !== "all") filter.status = status;

    const total = await PharmacyOrder.countDocuments(filter);
    const orders = await PharmacyOrder.find(filter)
      .populate("patient_id", "name email mobile phone")
      .populate("prescription_id", "prescription_number doctor_name file_url")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, orders, total, page, limit, "Pharmacy orders retrieved");
  } catch (err) {
    next(err);
  }
};

// GET /api/pharmacy-orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await PharmacyOrder.findById(req.params.id)
      .populate("pharmacy_id", "name address phone area city rating is_24_7")
      .populate("patient_id", "name email mobile phone")
      .populate("prescription_id");

    if (!order) return errorResponse(res, "Order not found", 404);

    // Permission check
    const isPatient = String(order.patient_id._id || order.patient_id) === String(req.user._id);
    const isOwner = req.user.role === "pharmacy_owner" || req.user.role === "pharmacist" || req.user.role === "super_admin";

    if (!isPatient && !isOwner) {
      return errorResponse(res, "Access denied", 403);
    }

    return successResponse(res, order, "Order retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/pharmacy-orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, "Invalid status provided", 400);
    }

    const order = await PharmacyOrder.findById(req.params.id);
    if (!order) return errorResponse(res, "Order not found", 404);

    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order marked as ${status.replace(/_/g, " ")}`
    });

    if (status === "delivered") {
      order.payment_status = "paid";
    }

    await order.save();
    return successResponse(res, order, `Order status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/pharmacy-orders/:id/verify-prescription
exports.verifyPrescription = async (req, res, next) => {
  try {
    const order = await PharmacyOrder.findById(req.params.id);
    if (!order) return errorResponse(res, "Order not found", 404);

    order.prescription_verified = true;
    order.verified_by = req.user._id;
    order.timeline.push({
      status: order.status,
      timestamp: new Date(),
      note: "Prescription verified by registered pharmacist"
    });

    await order.save();
    return successResponse(res, order, "Prescription verified successfully");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/pharmacy-orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await PharmacyOrder.findById(req.params.id);
    if (!order) return errorResponse(res, "Order not found", 404);

    if (["delivered", "cancelled"].includes(order.status)) {
      return errorResponse(res, `Cannot cancel order that is already ${order.status}`, 400);
    }

    order.status = "cancelled";
    order.cancel_reason = reason || "Cancelled by user";
    order.timeline.push({
      status: "cancelled",
      timestamp: new Date(),
      note: `Order cancelled. Reason: ${reason || "N/A"}`
    });

    await order.save();

    // Restock items
    for (const item of order.items) {
      await PharmacyInventory.findOneAndUpdate(
        { pharmacy_id: order.pharmacy_id, medicine_id: item.medicine_id },
        { $inc: { stock_quantity: item.quantity } }
      );
    }

    return successResponse(res, order, "Order cancelled and items restocked");
  } catch (err) {
    next(err);
  }
};
