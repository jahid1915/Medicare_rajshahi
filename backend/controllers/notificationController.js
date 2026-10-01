const Notification = require("../models/Notification");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

/**
 * GET /api/notifications
 * Get authenticated user's notifications with unread count
 */
exports.getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const filter = { user_id: userId };
    if (unreadOnly === "true") {
      filter.is_read = false;
    }

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments(filter),
      Notification.countDocuments({ user_id: userId, is_read: false }),
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1
      },
      message: "Notifications retrieved successfully"
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark single notification as read (Strictly checks user ownership)
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return errorResponse(res, "Notification not found", 404, "NOT_FOUND");
    }

    // Security check: User cannot read/modify another user's notification
    if (notification.user_id.toString() !== userId && req.user.role !== "super_admin") {
      return errorResponse(res, "Access denied. Cannot access notifications belonging to another account.", 403, "FORBIDDEN");
    }

    notification.is_read = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({ user_id: userId, is_read: false });

    return successResponse(res, { notification, unreadCount }, "Notification marked as read");
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for authenticated user
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    await Notification.updateMany(
      { user_id: userId, is_read: false },
      { $set: { is_read: true } }
    );

    return successResponse(res, { unreadCount: 0 }, "All notifications marked as read");
  } catch (err) {
    next(err);
  }
};

/**
 * Helper to dispatch in-app notifications internally
 */
exports.createNotification = async ({ user_id, type, title, message, reference_id, reference_type, channels = ["in_app"] }) => {
  try {
    return await Notification.create({
      user_id,
      type,
      title,
      message,
      reference_id,
      reference_type,
      channels
    });
  } catch (err) {
    console.warn("Failed to create in-app notification:", err.message);
    return null;
  }
};
