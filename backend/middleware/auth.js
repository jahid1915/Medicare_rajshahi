const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responseHelper");

/**
 * Verify JWT token from Authorization: Bearer <token> header
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Authentication required", 401, "NO_TOKEN");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(err); // Let errorHandler handle JWT errors
  }
};

/**
 * Optional auth — attaches user if token present, but does not block
 * Useful for routes that work both publicly and with extra data for logged-in users
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_) {
    // Invalid token — proceed as unauthenticated
  }
  next();
};

/**
 * Role-based access control
 * Usage: authorize("super_admin", "hospital_admin")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of: ${roles.join(", ")}`,
        403,
        "FORBIDDEN"
      );
    }
    next();
  };
};

/**
 * Hospital admin can only access their own hospital
 */
const ownHospitalOnly = (req, res, next) => {
  if (req.user.role === "super_admin") return next(); // super admin bypasses
  const requestedHospitalId = req.params.hospitalId || req.body.hospital_id;
  if (["hospital_admin", "hospital_management"].includes(req.user.role) && req.user.hospital_id?.toString() !== requestedHospitalId) {
    return errorResponse(res, "You can only manage your own hospital", 403, "WRONG_HOSPITAL");
  }
  next();
};

/**
 * Pharmacy owner can only access their own pharmacy
 */
const ownPharmacyOnly = (req, res, next) => {
  if (req.user.role === "super_admin") return next();
  const requestedPharmacyId = req.params.pharmacyId || req.body.pharmacy_id;
  if (["pharmacy_owner", "pharmacist"].includes(req.user.role) && req.user.pharmacy_id?.toString() !== requestedPharmacyId) {
    return errorResponse(res, "You can only manage your own pharmacy", 403, "WRONG_PHARMACY");
  }
  next();
};

module.exports = { protect, optionalAuth, authorize, ownHospitalOnly, ownPharmacyOnly };

