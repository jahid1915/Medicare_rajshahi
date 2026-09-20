const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const Pharmacy = require("../models/Pharmacy");
const Doctor = require("../models/Doctor");
const AuditLog = require("../models/AuditLog");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      _id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      hospital_id: user.hospital_id,
      pharmacy_id: user.pharmacy_id
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const {
      name, email, phone, password, role,
      date_of_birth, gender, address, blood_group,
      // Hospital Authority fields
      hospital_id, hospital_name, hospital_type, hospital_address, hospital_department,
      // Pharmacy Owner fields
      pharmacy_id, pharmacy_name, pharmacy_address, pharmacy_area, pharmacy_license,
      // Doctor fields
      specialization, qualifications, bmdc_number
    } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, "Name, email and password are required", 422);
    }

    // Allowed self-registration roles
    const allowedSelfRoles = ["patient", "doctor", "pharmacy_owner", "hospital_admin"];
    const assignedRole = allowedSelfRoles.includes(role) ? role : "patient";

    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, "Email already registered", 409, "DUPLICATE_EMAIL");

    const userData = { name, email, phone, password, role: assignedRole };

    // Patient profile fields
    if (date_of_birth) userData.date_of_birth = new Date(date_of_birth);
    if (gender) userData.gender = gender;
    if (address) userData.address = address;
    if (blood_group) userData.blood_group = blood_group;

    // Hospital Authority according to each hospital
    if (assignedRole === "hospital_admin") {
      let matchedHospital = null;
      if (hospital_id) {
        matchedHospital = await Hospital.findById(hospital_id);
      }
      if (!matchedHospital && hospital_name) {
        matchedHospital = await Hospital.findOne({ name: new RegExp(`^${hospital_name.trim()}$`, "i") });
        if (!matchedHospital) {
          // Create new hospital entry for Rajshahi
          matchedHospital = await Hospital.create({
            name: hospital_name.trim(),
            type: hospital_type || "private",
            city: "Rajshahi",
            district: "Rajshahi",
            division: "Rajshahi",
            address: hospital_address || "Rajshahi",
            phone: phone || null,
            email: email,
            is_verified: true,
            verification_level: "hospital_verified"
          });
        }
      }

      if (matchedHospital) {
        userData.hospital_id = matchedHospital._id;
      }
    }

    // Pharmacy Owner
    if (assignedRole === "pharmacy_owner") {
      let matchedPharmacy = null;
      if (pharmacy_id) {
        matchedPharmacy = await Pharmacy.findById(pharmacy_id);
      }
      if (!matchedPharmacy && pharmacy_name) {
        matchedPharmacy = await Pharmacy.findOne({ name: new RegExp(`^${pharmacy_name.trim()}$`, "i") });
        if (!matchedPharmacy) {
          matchedPharmacy = await Pharmacy.create({
            name: pharmacy_name.trim(),
            phone: phone || "01700000000",
            email: email,
            address: pharmacy_address || "Rajshahi",
            area: pharmacy_area || "Laxmipur",
            city: "Rajshahi",
            license_number: pharmacy_license || `TRADE-RAJ-${Math.floor(10000 + Math.random() * 90000)}`,
            is_verified: true,
            is_active: true
          });
        }
      }

      if (matchedPharmacy) {
        userData.pharmacy_id = matchedPharmacy._id;
      }
    }

    const user = await User.create(userData);

    // If pharmacy owner was created, update pharmacy owner_id reference
    if (assignedRole === "pharmacy_owner" && userData.pharmacy_id) {
      await Pharmacy.findByIdAndUpdate(userData.pharmacy_id, { owner_id: user._id });
    }

    const token = generateToken(user);

    // Populate organization details before returning
    const populatedUser = await User.findById(user._id)
      .populate("hospital_id", "name short_name area address type")
      .populate("pharmacy_id", "name area address phone");

    await AuditLog.create({
      actor_id: user._id,
      actor_name: name,
      actor_role: assignedRole,
      action: "USER_REGISTERED",
      detail: `New ${assignedRole} account created.${userData.hospital_id ? ` Linked to hospital: ${userData.hospital_id}` : ""}${userData.pharmacy_id ? ` Linked to pharmacy: ${userData.pharmacy_id}` : ""}`
    });

    return successResponse(res, { user: populatedUser, token }, "Registration successful", 201);
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

    const user = await User.findOne({ email })
      .select("+password")
      .populate("hospital_id", "name short_name area address type")
      .populate("pharmacy_id", "name area address phone");

    if (!user || !(await user.comparePassword(password)))
      return errorResponse(res, "Invalid email or password", 401, "INVALID_CREDENTIALS");

    if (!user.is_active)
      return errorResponse(res, "Your account has been deactivated. Please contact support.", 403, "ACCOUNT_DISABLED");

    user.last_login = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);

    await AuditLog.create({
      actor_id: user._id,
      actor_name: user.name,
      actor_role: user.role,
      action: "USER_LOGIN",
      ip_address: req.ip
    });

    return successResponse(res, { user, token }, "Login successful");
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("hospital_id", "name short_name area address type")
      .populate("pharmacy_id", "name area address phone");

    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, user, "Profile fetched");
  } catch (err) {
    next(err);
  }
};

