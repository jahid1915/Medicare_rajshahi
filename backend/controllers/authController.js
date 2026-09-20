const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, hospital_id: user.hospital_id, pharmacy_id: user.pharmacy_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, date_of_birth, gender, address, blood_group } = req.body;
    if (!name || !email || !password)
      return errorResponse(res, "Name, email and password are required", 422);

    // Patients and doctors can self-register. Other roles require super_admin approval.
    const allowedSelfRoles = ["patient", "doctor"];
    const assignedRole = allowedSelfRoles.includes(role) ? role : "patient";

    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, "Email already registered", 409, "DUPLICATE_EMAIL");

    const userData = { name, email, phone, password, role: assignedRole };
    // Add patient profile fields if provided
    if (date_of_birth) userData.date_of_birth = new Date(date_of_birth);
    if (gender) userData.gender = gender;
    if (address) userData.address = address;
    if (blood_group) userData.blood_group = blood_group;

    const user = await User.create(userData);
    const token = generateToken(user);

    await AuditLog.create({
      actor_id: user._id, actor_name: name, actor_role: assignedRole,
      action: "USER_REGISTERED", detail: `New ${assignedRole} account created`
    });

    return successResponse(res, { user, token }, "Registration successful", 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return errorResponse(res, "Email and password are required", 422);

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return errorResponse(res, "Invalid email or password", 401, "INVALID_CREDENTIALS");

    if (!user.is_active)
      return errorResponse(res, "Your account has been deactivated. Please contact support.", 403, "ACCOUNT_DISABLED");

    user.last_login = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);

    await AuditLog.create({
      actor_id: user._id, actor_name: user.name, actor_role: user.role,
      action: "USER_LOGIN", ip_address: req.ip
    });

    return successResponse(res, { user, token }, "Login successful");
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, user, "Profile fetched");
  } catch (err) {
    next(err);
  }
};

