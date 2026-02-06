const express = require("express");
const router = express.Router();
const {
  getPublicSettings,
  getAllSettings,
  getSetting,
  updateSetting,
  updatePromoBanner,
} = require("../controllers/settingsController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Public routes
router.get("/public", getPublicSettings);

// Admin routes
router.get("/", protect, admin, getAllSettings);

// Specific routes MUST come before parameterized routes
router.put("/promo-banner/update", protect, admin, updatePromoBanner);

// Parameterized routes (must be last)
router.get("/:key", protect, admin, getSetting);
router.put("/:key", protect, admin, updateSetting);

module.exports = router;
