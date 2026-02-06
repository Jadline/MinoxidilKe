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
router.get("/:key", protect, admin, getSetting);
router.put("/:key", protect, admin, updateSetting);
router.put("/promo-banner/update", protect, admin, updatePromoBanner);

module.exports = router;
