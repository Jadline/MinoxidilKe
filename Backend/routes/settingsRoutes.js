const express = require("express");
const router = express.Router();
const {
  getPublicSettings,
  getAllSettings,
  getSetting,
  updateSetting,
  updatePromoBanner,
} = require("../controllers/settingsController");
const { authMiddleware, requireRole } = require("../middlewares/authMiddleware");

// Public routes
router.get("/public", getPublicSettings);

// Admin routes
router.get("/", authMiddleware, requireRole(["admin"]), getAllSettings);

// Specific routes MUST come before parameterized routes
router.put("/promo-banner/update", authMiddleware, requireRole(["admin"]), updatePromoBanner);

// Parameterized routes (must be last)
router.get("/:key", authMiddleware, requireRole(["admin"]), getSetting);
router.put("/:key", authMiddleware, requireRole(["admin"]), updateSetting);

module.exports = router;
