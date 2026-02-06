const { Settings } = require("../models/Settings");

// Get all settings (public - for frontend to fetch promo banner etc.)
const getPublicSettings = async (req, res) => {
  try {
    const promoBanner = await Settings.getSetting("promoBanner", {
      enabled: true,
      text: "Get free delivery on orders over",
      freeDeliveryThreshold: 6000,
      showTruckEmoji: true,
    });

    res.status(200).json({
      success: true,
      data: {
        promoBanner,
      },
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

// Get all settings (admin only)
const getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find({});
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching all settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

// Get a specific setting by key
const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: `Setting '${key}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch setting",
    });
  }
};

// Update a setting (admin only)
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Value is required",
      });
    }

    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, ...(description && { description }) },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `Setting '${key}' updated successfully`,
      data: setting,
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update setting",
    });
  }
};

// Update promo banner settings (admin only)
const updatePromoBanner = async (req, res) => {
  try {
    const { enabled, text, freeDeliveryThreshold, showTruckEmoji } = req.body;

    // Get current promo banner settings
    const currentSettings = await Settings.getSetting("promoBanner", {
      enabled: true,
      text: "Get free delivery on orders over",
      freeDeliveryThreshold: 6000,
      showTruckEmoji: true,
    });

    // Merge with new values
    const newSettings = {
      enabled: enabled !== undefined ? enabled : currentSettings.enabled,
      text: text !== undefined ? text : currentSettings.text,
      freeDeliveryThreshold:
        freeDeliveryThreshold !== undefined
          ? freeDeliveryThreshold
          : currentSettings.freeDeliveryThreshold,
      showTruckEmoji:
        showTruckEmoji !== undefined ? showTruckEmoji : currentSettings.showTruckEmoji,
    };

    const setting = await Settings.setSetting(
      "promoBanner",
      newSettings,
      "Promo banner configuration"
    );

    res.status(200).json({
      success: true,
      message: "Promo banner settings updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Error updating promo banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update promo banner settings",
    });
  }
};

module.exports = {
  getPublicSettings,
  getAllSettings,
  getSetting,
  updateSetting,
  updatePromoBanner,
};
