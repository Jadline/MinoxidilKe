/**
 * Seed 7 packages from images in public/uploads/packages.
 * Run from Backend: node dev-data/seedPackages.js
 * Uses config.env from Backend folder.
 */
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load config from Backend root
dotenv.config({ path: path.join(__dirname, "..", "config.env") });
const Package = require("../models/packageModel");

const UPLOADS_DIR = path.join(__dirname, "..", "public", "uploads", "packages");

const DEFAULT_NAMES = [
  "Starter Hair Care Pack",
  "Growth Essentials Pack",
  "Complete Regrowth Kit",
  "Premium Minoxidil Bundle",
  "Hair Health Combo",
  "Full Treatment Package",
  "Value Hair Care Pack",
];

const DEFAULT_BUNDLE_PRICE = 5000;
const DEFAULT_RATING = 4.5;
const DEFAULT_QUANTITY_LABEL = "1 pack";

async function seedPackages() {
  const DB = process.env.DATABASE;
  if (!DB) {
    console.error("DATABASE not set in config.env");
    process.exit(1);
  }

  // #region agent log
  const logPath = path.join(__dirname, "..", "..", ".cursor", "debug.log");
  try {
    fs.appendFileSync(
      logPath,
      JSON.stringify({
        location: "seedPackages.js:seedPackages",
        message: "Seed packages from uploads dir",
        data: {},
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H1",
      }) + "\n"
    );
  } catch (_) {}
  // #endregion
  try {
    await mongoose.connect(DB);
    console.log("Database connected.");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }

  let filenames = [];
  if (fs.existsSync(UPLOADS_DIR)) {
    filenames = fs.readdirSync(UPLOADS_DIR).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return (
        [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) &&
        f !== ".gitkeep"
      );
    });
  }

  if (filenames.length === 0) {
    console.log(
      "No images found in public/uploads/packages. Add images there and run again."
    );
    process.exit(0);
  }

  const nextId = await Package.aggregate([
    { $group: { _id: null, maxId: { $max: "$id" } } },
  ]).then((r) => (r[0]?.maxId ?? 0) + 1);

  const packagesToInsert = filenames.slice(0, 7).map((filename, index) => {
    const id = nextId + index;
    const name = DEFAULT_NAMES[index] ?? `Package ${id}`;
    const imagePath = "/uploads/packages/" + encodeURIComponent(filename);
    return {
      id,
      name,
      description: `Hair care package – ${name}. Save when you buy together.`,
      imageSrc: imagePath,
      imageAlt: name,
      productIds: [],
      bundlePrice: DEFAULT_BUNDLE_PRICE,
      quantityLabel: DEFAULT_QUANTITY_LABEL,
      rating: DEFAULT_RATING,
      inStock: true,
      category: "packages",
      leadTime: "2-3 days",
    };
  });

  try {
    await Package.insertMany(packagesToInsert);
    console.log(`Inserted ${packagesToInsert.length} packages.`);
  } catch (err) {
    if (err.code === 11000) {
      console.log(
        "Some packages already exist (duplicate id). Delete existing packages or use different ids."
      );
    }
    console.error("Insert error:", err.message);
    process.exit(1);
  }

  process.exit(0);
}

seedPackages();
