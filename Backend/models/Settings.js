const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Static method to get a setting by key
settingsSchema.statics.getSetting = async function (key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set a setting
settingsSchema.statics.setSetting = async function (key, value, description = "") {
  return this.findOneAndUpdate(
    { key },
    { value, description },
    { upsert: true, new: true }
  );
};

// Static method to get all settings
settingsSchema.statics.getAllSettings = async function () {
  const settings = await this.find({});
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
};

const Settings = mongoose.model("Settings", settingsSchema);

// Default settings to initialize
const defaultSettings = {
  promoBanner: {
    enabled: true,
    text: "Get free delivery on orders over",
    freeDeliveryThreshold: 6000,
    showTruckEmoji: true,
  },
  siteName: "MinoxidilKe",
  contactEmail: "support@minoxidilke.com",
  contactPhone: "+254700000000",
};

// Initialize default settings if they don't exist
const initializeSettings = async () => {
  try {
    for (const [key, value] of Object.entries(defaultSettings)) {
      const existing = await Settings.findOne({ key });
      if (!existing) {
        await Settings.create({ key, value });
        console.log(`Initialized setting: ${key}`);
      }
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
  }
};

module.exports = { Settings, initializeSettings };
