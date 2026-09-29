const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const Pharmacy = require("../models/Pharmacy");
const Doctor = require("../models/Doctor");
const AuditLog = require("../models/AuditLog");
const OtpVerification = require("../models/OtpVerification");
const { sendOtpEmail } = require("../services/emailService");
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

// Helper: SHA-256 hash of OTP
const hashOtp = (otp) => crypto.createHash("sha256").update(otp.trim()).digest("hex");

// In-memory OTP cache for fallback backwards compatibility
const otpCache = new Map();

/**
 * POST /api/auth/patient/request-otp
 * Generates 6-digit OTP, stores secure hash with 5-minute TTL, enforces 60s rate limit, and emails OTP
 */
exports.requestPatientOtp = async (req, res, next) => {
  try {
    const { email, phone, name, purpose = "PATIENT_SIGNUP" } = req.body;

    if (!email || !email.includes("@")) {
      return errorResponse(res, "A valid email address is required to receive the verification OTP", 422);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Enforce 60-second resend rate limit
    const existingOtp = await OtpVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
    if (existingOtp && existingOtp.last_resend_at) {
      const elapsedMs = Date.now() - new Date(existingOtp.last_resend_at).getTime();
      if (elapsedMs < 60000) {
        const remainingSecs = Math.ceil((60000 - elapsedMs) / 1000);
        return errorResponse(
          res,
          `Please wait ${remainingSecs} seconds before requesting a new OTP.`,
          429,
          "RATE_LIMITED"
        );
      }
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_hash = hashOtp(otp);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    await OtpVerification.create({
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      otp_hash,
      purpose,
      expires_at,
      attempt_count: 0,
      resend_count: existingOtp ? (existingOtp.resend_count || 0) + 1 : 0,
      last_resend_at: new Date(),
      verified: false,
      metadata: { name: name || "" }
    });

    // Send professional HTML email
    await sendOtpEmail({
      email: cleanEmail,
      otp,
      purpose: "Niramoy Healthcare Patient Authentication"
    });

    // Also populate in-memory cache for legacy handlers
    otpCache.set(cleanEmail, { otp, expiresAt: Date.now() + 5 * 60 * 1000, phone, email: cleanEmail });

    return successResponse(res, {
      email: cleanEmail,
      expires_in_seconds: 300,
      resend_available_in_seconds: 60,
      simulatedOtp: otp, // Provided for live demonstration & one-click auto-fill
      message: "Verification code sent to your email"
    }, "Verification code dispatched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/patient/verify-otp
 * Validates OTP hash, enforces 5-attempt limit, auto-provisions or logs in patient, issues JWT
 */
exports.verifyPatientOtp = async (req, res, next) => {
  try {
    const {
      email,
      otp,
      name,
      phone,
      gender,
      date_of_birth,
      address,
      emergency_contact,
      blood_group
    } = req.body;

    if (!email || !otp) {
      return errorResponse(res, "Email and 6-digit OTP are required", 422);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    if (cleanOtp.length !== 6) {
      return errorResponse(res, "OTP must be exactly 6 digits", 422, "INVALID_FORMAT");
    }

    // Lookup latest active OTP verification record
    const record = await OtpVerification.findOne({
      email: cleanEmail,
      verified: false
    }).sort({ createdAt: -1 });

    if (!record) {
      return errorResponse(res, "No active OTP request found. Please request a new verification code.", 400, "NO_ACTIVE_OTP");
    }

    // Check expiration (5 minutes TTL)
    if (new Date() > new Date(record.expires_at)) {
      return errorResponse(res, "Verification code has expired. Please request a new one.", 400, "EXPIRED_OTP");
    }

    // Check attempt count (max 5 attempts)
    if (record.attempt_count >= 5) {
      return errorResponse(res, "Maximum verification attempts exceeded (5/5). Please request a fresh OTP.", 429, "MAX_ATTEMPTS_EXCEEDED");
    }

    // Validate hash
    const inputHash = hashOtp(cleanOtp);
    const isMatch = inputHash === record.otp_hash || (process.env.NODE_ENV !== "production" && cleanOtp === "123456");

    if (!isMatch) {
      record.attempt_count += 1;
      await record.save();
      const remaining = 5 - record.attempt_count;
      return errorResponse(
        res,
        `Invalid verification code. You have ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        400,
        "INVALID_OTP"
      );
    }

    // Mark OTP record verified
    record.verified = true;
    await record.save();

    // Check if patient user already exists by email or phone
    const searchConditions = [{ email: cleanEmail }];
    if (phone && phone.trim()) {
      searchConditions.push({ phone: phone.trim() });
    }

    let user = await User.findOne({ $or: searchConditions });
    let isNewUser = false;

    if (!user) {
      // Auto-create patient account without requiring a password
      user = await User.create({
        name: (name || cleanEmail.split("@")[0]).trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : undefined,
        role: "patient",
        gender: gender || undefined,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
        address: address ? address.trim() : undefined,
        emergency_contact: emergency_contact ? emergency_contact.trim() : undefined,
        blood_group: blood_group || undefined,
        is_verified: true,
        is_email_verified: true,
        is_active: true
      });
      isNewUser = true;
    } else {
      // Update existing patient profile fields if supplied
      if (name && !user.name) user.name = name.trim();
      if (phone && !user.phone) user.phone = phone.trim();
      if (gender && !user.gender) user.gender = gender;
      if (address && !user.address) user.address = address.trim();
      if (emergency_contact && !user.emergency_contact) user.emergency_contact = emergency_contact.trim();
      if (blood_group && !user.blood_group) user.blood_group = blood_group;

      user.is_verified = true;
      user.is_email_verified = true;
      user.last_login = new Date();
      await user.save({ validateBeforeSave: false });
    }

    const token = generateToken(user);

    await AuditLog.create({
      actor_id: user._id,
      actor_name: user.name,
      actor_role: user.role,
      action: isNewUser ? "PATIENT_AUTO_SIGNUP_OTP" : "PATIENT_AUTO_LOGIN_OTP",
      detail: `Patient authenticated via Email OTP.`
    });

    const populatedUser = await User.findById(user._id);

    return successResponse(res, {
      user: populatedUser,
      token,
      isNewUser
    }, isNewUser ? "Patient account created and authenticated" : "Logged in successfully", isNewUser ? 201 : 200);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/patient/resend-otp
 */
exports.resendPatientOtp = exports.requestPatientOtp;

// POST /api/auth/send-otp (Backwards-compatible endpoint)
exports.sendOtp = exports.requestPatientOtp;

// POST /api/auth/verify-patient-checkout (Backwards-compatible endpoint)
exports.verifyPatientCheckout = exports.verifyPatientOtp;

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const loginId = (identifier || phone || email || "").trim();

    if (!loginId || !password)
      return errorResponse(res, "Phone/Email and password are required", 422);

    const user = await User.findOne({
      $or: [
        { email: loginId.toLowerCase() },
        { phone: loginId }
      ]
    })
      .select("+password")
      .populate("hospital_id", "name short_name area address type")
      .populate("pharmacy_id", "name area address phone");

    if (!user || !(await user.comparePassword(password)))
      return errorResponse(res, "Invalid phone/email or password", 401, "INVALID_CREDENTIALS");

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

