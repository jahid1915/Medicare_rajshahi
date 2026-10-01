const axios = require("axios");

/**
 * Normalizes a Bangladeshi phone number to both local 11-digit ('01XXXXXXXXX')
 * and international 13-digit ('8801XXXXXXXXX') formats.
 */
function normalizePhoneNumber(rawPhone) {
  if (!rawPhone) return { isValid: false, local: "", international: "" };

  // Remove spaces, dashes, parentheses, plus signs
  let cleaned = String(rawPhone).replace(/[\s\-\(\)\+]/g, "").trim();

  // If starts with 880, strip 88 to get local 01...
  if (cleaned.startsWith("880") && cleaned.length === 13) {
    cleaned = cleaned.substring(2);
  }

  // Check valid Bangladeshi mobile operator prefix: 013, 014, 015, 016, 017, 018, 019
  const bdRegex = /^01[3-9]\d{8}$/;
  if (!bdRegex.test(cleaned)) {
    return { isValid: false, local: cleaned, international: "" };
  }

  return {
    isValid: true,
    local: cleaned, // 017XXXXXXXX
    international: `88${cleaned}` // 88017XXXXXXXX
  };
}

/**
 * MIM SMS Service
 * Sends SMS via MIM SMS API or simulates safely in dev environment
 */
async function sendSms({ phone, message }) {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized.isValid) {
    throw new Error(`Invalid Bangladeshi phone number: ${phone}`);
  }

  const apiKey = process.env.MIM_SMS_API_KEY;
  const senderId = process.env.MIM_SMS_SENDER_ID || "NIRAMOY";
  const baseUrl = process.env.MIM_SMS_BASE_URL || "https://api.mimsms.com/api/sendsms";

  // If MIM SMS API key is configured, perform real HTTP dispatch
  if (apiKey && apiKey !== "your_mim_sms_api_key_here") {
    try {
      const response = await axios.post(
        baseUrl,
        {
          api_key: apiKey,
          type: "text",
          contacts: normalized.international,
          senderid: senderId,
          msg: message
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000
        }
      );

      console.log(`[SMS Service] MIM SMS dispatched to ${normalized.local}. Gateway Response:`, response.data);
      return { success: true, gateway: "MIM_SMS", response: response.data };
    } catch (err) {
      console.error(`[SMS Service Error] MIM SMS dispatch failed for ${normalized.local}:`, err.message);
      throw new Error(`SMS delivery gateway error: ${err.message}`);
    }
  } else {
    // Development / Sandbox mode: Log delivery without exposing to client
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      console.log(`[SMS Service DEV LOG] SMS dispatched to ${normalized.local}: "${message}"`);
    } else {
      console.warn(`[SMS Service WARN] MIM_SMS_API_KEY not configured in production environment.`);
    }
    return { success: true, simulated: true };
  }
}

/**
 * Sends a one-time password (OTP) via SMS
 */
async function sendOtpSms({ phone, otp, expiryMinutes = 5 }) {
  const message = `Your Niramoy healthcare verification code is ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;
  return sendSms({ phone, message });
}

/**
 * Sends an appointment confirmation notification via SMS
 */
async function sendAppointmentConfirmationSms({ phone, doctorName, date, serialNumber }) {
  const message = `Niramoy: Appointment confirmed with ${doctorName} on ${date}. Serial: ${serialNumber}. Please arrive 15 minutes before your slot.`;
  return sendSms({ phone, message });
}

module.exports = {
  normalizePhoneNumber,
  sendSms,
  sendOtpSms,
  sendAppointmentConfirmationSms
};
