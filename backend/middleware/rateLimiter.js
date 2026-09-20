const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: "Too many requests, please try again later.", code: "RATE_LIMITED" }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Strict limit for login/register
  message: { success: false, message: "Too many auth attempts, please try again later.", code: "RATE_LIMITED" }
});

const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many payment requests.", code: "RATE_LIMITED" }
});

module.exports = { generalLimiter, authLimiter, paymentLimiter };
