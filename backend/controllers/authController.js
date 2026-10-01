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

const { normalizePhoneNumber, sendOtpSms } = require("../services/smsService");

// Helper: SHA-256 hash of OTP
const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp).trim()).digest("hex");

/**
 * POST /api/auth/send-otp (and alias /patient/request-otp, /patient/resend-otp)
 * Phone-first OTP generation:
 * 1. Validates phone number (Bangladeshi 01XXXXXXXXX)
 * 2. Enforces 60-second cooldown per phone/email
 * 3. Invalidates previous active OTPs
 * 4. Stores SHA-256 hash with 5-minute TTL
 * 5. Dispatches SMS via MIM SMS
 * 6. Returns ONLY success/failure — NEVER exposes OTP in response
 */
exports.sendOtp = async (req, res, next) => {
  try {
    const { phone, email, purpose = "PATIENT_SIGNUP" } = req.body;

    if (!phone && !email) {
      return errorResponse(res, "Mobile phone number is required to receive verification code", 422);
    }

    let normalizedPhone = null;
    let cleanEmail = null;

    if (phone) {
      const norm = normalizePhoneNumber(phone);
      if (!norm.isValid) {
        return errorResponse(res, "Please provide a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX)", 422, "INVALID_PHONE");
      }
      normalizedPhone = norm.local;
    }

    if (email) {
      cleanEmail = email.trim().toLowerCase();
    }

    // Rate-limiting check: enforce 60s cooldown on the target identifier
    const searchFilter = normalizedPhone ? { phone: normalizedPhone } : { email: cleanEmail };
    const latestOtp = await OtpVerification.findOne(searchFilter).sort({ createdAt: -1 });

    if (latestOtp && latestOtp.last_resend_at) {
      const elapsedMs = Date.now() - new Date(latestOtp.last_resend_at).getTime();
      if (elapsedMs < 60000) {
        const remainingSecs = Math.ceil((60000 - elapsedMs) / 1000);
        return errorResponse(
          res,
          `Please wait ${remainingSecs} seconds before requesting a new verification code.`,
          429,
          "RATE_LIMITED"
        );
      }
    }

    // Invalidate any existing unused OTPs for this phone/email to prevent replay
    await OtpVerification.updateMany(
      { ...searchFilter, verified: false },
      { $set: { verified: true } }
    );

    // Generate secure 6-digit cryptographic OTP (100000 - 999999)
    const otp = crypto.randomInt(100000, 999999).toString();
    const otp_hash = hashOtp(otp);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    await OtpVerification.create({
      phone: normalizedPhone || undefined,
      email: cleanEmail || undefined,
      otp_hash,
      purpose,
      expires_at,
      attempt_count: 0,
      resend_count: latestOtp ? (latestOtp.resend_count || 0) + 1 : 0,
      last_resend_at: new Date(),
      verified: false
    });

    // Dispatch OTP: SMS primary, Email fallback if email-only
    if (normalizedPhone) {
      await sendOtpSms({ phone: normalizedPhone, otp, expiryMinutes: 5 });
    } else if (cleanEmail) {
      await sendOtpEmail({
        email: cleanEmail,
        otp,
        purpose: "Niramoy Healthcare Authentication"
      });
    }

    // Return strictly sanitized response — ZERO OTP exposure
    return successResponse(res, {
      destination: normalizedPhone || cleanEmail,
      channel: normalizedPhone ? "sms" : "email",
      expires_in_seconds: 300,
      resend_available_in_seconds: 60,
      message: normalizedPhone 
        ? `Verification code sent via SMS to ${normalizedPhone.slice(0, 3)}****${normalizedPhone.slice(-3)}`
        : `Verification code sent to your email`
    }, "Verification code dispatched successfully");
  } catch (err) {
    next(err);
  }
};

exports.requestPatientOtp = exports.sendOtp;
exports.resendPatientOtp = exports.sendOtp;

/**
 * POST /api/auth/verify-otp (and alias /patient/verify-otp)
 * Phone-first OTP verification:
 * 1. Checks 6-digit format
 * 2. Checks active record, expiry, max 5 attempts
 * 3. Compares SHA-256 hash server-side
 * 4. Marks OTP used
 * 5. Finds or creates minimal Patient account (phone, role, ID, timestamps)
 * 6. Returns JWT and authenticated user (without password)
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, email, otp } = req.body;

    if (!otp) {
      return errorResponse(res, "Verification code is required", 422);
    }

    const cleanOtp = String(otp).trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return errorResponse(res, "Verification code must be exactly 6 digits", 422, "INVALID_FORMAT");
    }

    let searchFilter = null;
    let normalizedPhone = null;

    if (phone) {
      const norm = normalizePhoneNumber(phone);
      if (!norm.isValid) {
        return errorResponse(res, "Invalid mobile phone number", 422, "INVALID_PHONE");
      }
      normalizedPhone = norm.local;
      searchFilter = { phone: normalizedPhone, verified: false };
    } else if (email) {
      searchFilter = { email: email.trim().toLowerCase(), verified: false };
    } else {
      return errorResponse(res, "Mobile phone number or email is required", 422);
    }

    // Lookup latest active OTP record
    const record = await OtpVerification.findOne(searchFilter).sort({ createdAt: -1 });

    if (!record) {
      return errorResponse(res, "No active verification code found. Please request a new code.", 400, "NO_ACTIVE_OTP");
    }

    // Check expiration (5 minutes TTL)
    if (new Date() > new Date(record.expires_at)) {
      return errorResponse(res, "Verification code has expired. Please request a new code.", 400, "EXPIRED_OTP");
    }

    // Check attempt count (max 5 attempts)
    if (record.attempt_count >= 5) {
      return errorResponse(res, "Maximum verification attempts exceeded. Please request a fresh code.", 429, "MAX_ATTEMPTS_EXCEEDED");
    }

    // Validate hash server-side
    const inputHash = hashOtp(cleanOtp);
    const isMatch = inputHash === record.otp_hash;

    if (!isMatch) {
      record.attempt_count += 1;
      await record.save();
      const remaining = 5 - record.attempt_count;
      return errorResponse(
        res,
        `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        400,
        "INVALID_OTP"
      );
    }

    // Mark OTP used
    record.verified = true;
    await record.save();

    // Find or create patient
    const userSearch = [];
    if (normalizedPhone) userSearch.push({ phone: normalizedPhone });
    if (email) userSearch.push({ email: email.trim().toLowerCase() });

    let user = await User.findOne({ $or: userSearch });
    let isNewUser = false;

    if (!user) {
      // Minimal verified patient creation: phone, ID, role: 'patient', timestamps
      user = await User.create({
        name: req.body.name ? req.body.name.trim() : "Patient",
        phone: normalizedPhone || undefined,
        email: email ? email.trim().toLowerCase() : undefined,
        role: "patient",
        is_verified: true,
        is_active: true
      });
      isNewUser = true;
    } else {
      user.is_verified = true;
      user.last_login = new Date();
      // If patient had no phone, save it
      if (normalizedPhone && !user.phone) user.phone = normalizedPhone;
      // If user supplied name during OTP verification
      if (req.body.name && (user.name === "Patient" || !user.name)) {
        user.name = req.body.name.trim();
      }
      await user.save({ validateBeforeSave: false });
    }

    const token = generateToken(user);

    await AuditLog.create({
      actor_id: user._id,
      actor_name: user.name || "Patient",
      actor_role: user.role,
      action: isNewUser ? "PATIENT_SIGNUP_PHONE_OTP" : "PATIENT_LOGIN_PHONE_OTP",
      detail: `Patient authenticated via Phone OTP (${user.phone || user.email})`
    });

    const populatedUser = await User.findById(user._id);

    return successResponse(res, {
      user: populatedUser,
      token,
      isNewUser,
      profileCompletion: populatedUser.calculateProfileCompletion ? populatedUser.calculateProfileCompletion() : null
    }, isNewUser ? "Patient account created successfully" : "Logged in successfully", isNewUser ? 201 : 200);
  } catch (err) {
    next(err);
  }
};

exports.verifyPatientOtp = exports.verifyOtp;
exports.verifyPatientCheckout = exports.verifyOtp;

/**
 * GET /api/auth/profile
 * Returns authenticated user profile with completion percentage and missing fields
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("hospital_id", "name short_name area address type")
      .populate("pharmacy_id", "name area address phone");

    if (!user) return errorResponse(res, "User not found", 404);

    const completion = user.calculateProfileCompletion ? user.calculateProfileCompletion() : null;

    return successResponse(res, {
      user,
      profileCompletion: completion
    }, "Profile retrieved successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/profile
 * Updates patient profile fields without blocking basic healthcare browsing
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return errorResponse(res, "User not found", 404);

    const {
      name,
      date_of_birth,
      gender,
      blood_group,
      address,
      profile_picture,
      preferred_language,
      // Emergency Info
      emergency_contact,
      emergency_contact_name,
      emergency_contact_relation,
      emergency_contact_phone,
      // Medical Info
      allergies,
      existing_conditions,
      previous_surgeries,
      current_medications,
      medical_history,
      // Optional
      email
    } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (date_of_birth !== undefined) user.date_of_birth = date_of_birth ? new Date(date_of_birth) : undefined;
    if (gender !== undefined) user.gender = gender;
    if (blood_group !== undefined) user.blood_group = blood_group.trim();
    if (address !== undefined) user.address = address.trim();
    if (profile_picture !== undefined) user.profile_picture = profile_picture;
    if (preferred_language !== undefined) user.preferred_language = preferred_language;

    // Emergency details
    if (emergency_contact_name !== undefined) user.emergency_contact_name = emergency_contact_name.trim();
    if (emergency_contact_relation !== undefined) user.emergency_contact_relation = emergency_contact_relation.trim();
    if (emergency_contact_phone !== undefined) user.emergency_contact_phone = emergency_contact_phone.trim();
    if (emergency_contact !== undefined) user.emergency_contact = emergency_contact.trim();

    // Medical details
    if (allergies !== undefined) user.allergies = typeof allergies === "string" ? allergies.trim() : JSON.stringify(allergies);
    if (existing_conditions !== undefined) user.existing_conditions = typeof existing_conditions === "string" ? existing_conditions.trim() : JSON.stringify(existing_conditions);
    if (previous_surgeries !== undefined) user.previous_surgeries = typeof previous_surgeries === "string" ? previous_surgeries.trim() : JSON.stringify(previous_surgeries);
    if (current_medications !== undefined) user.current_medications = typeof current_medications === "string" ? current_medications.trim() : JSON.stringify(current_medications);
    if (medical_history !== undefined) user.medical_history = typeof medical_history === "string" ? medical_history.trim() : JSON.stringify(medical_history);

    // Optional email update (check duplication)
    if (email && email.trim() && email.trim().toLowerCase() !== user.email) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
      if (existing) {
        return errorResponse(res, "This email is already in use by another account", 409, "DUPLICATE_EMAIL");
      }
      user.email = cleanEmail;
    }

    await user.save();

    const completion = user.calculateProfileCompletion ? user.calculateProfileCompletion() : null;

    return successResponse(res, {
      user,
      profileCompletion: completion
    }, "Profile updated successfully");
  } catch (err) {
    next(err);
  }
};


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

