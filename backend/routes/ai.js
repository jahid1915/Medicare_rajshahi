const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/auth");
const User = require("../models/User");
const aiService = require("../services/aiService");

/**
 * @route   POST /api/ai/chat
 * @desc    Process natural language query with Niramoy-aware data retrieval
 * @access  Public (Level 1) or Authenticated Patient (Level 2)
 */
router.post("/chat", optionalAuth, async (req, res, next) => {
  try {
    const { message, text } = req.body;
    const userMessage = message || text || "";

    let authenticatedUser = null;
    if (req.user && (req.user.id || req.user._id)) {
      const uid = req.user.id || req.user._id;
      authenticatedUser = await User.findById(uid).select("-password -password_hash").lean();
    }

    const result = await aiService.processQuery({
      userMessage,
      user: authenticatedUser,
      role: authenticatedUser ? authenticatedUser.role : "anonymous"
    });

    return res.json(result);
  } catch (err) {
    console.error("[AI Route Error]:", err);
    return res.status(500).json({
      success: false,
      reply: "I couldn't retrieve the latest Niramoy data right now. Please try again or open the relevant section directly.",
      entities: [],
      suggestedActions: [
        { label: "Find Doctors", link: "/doctors" },
        { label: "Emergency Ambulance", link: "/ambulance" }
      ]
    });
  }
});

module.exports = router;
