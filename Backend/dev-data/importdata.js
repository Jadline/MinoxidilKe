/**
 * Import/delete products from dev-data/products.json.
 * WARNING: --delete then --import replaces ALL products with seed data and
 * removes any uploaded image paths (images in public/uploads/products remain on disk but products will reference JSON filenames like "minoxidilformen.png").
 * Only run when intentionally resetting product data.
 */
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("../models/productModel");
const fs = require("fs");

dotenv.config({ path: "./config.env" });

const productsdata = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, "utf-8")
);

const DB = process.env.DATABASE;

async function connectDB() {
  try {
    await mongoose.connect(DB);
    console.log("Database connected successfull");
  } catch (err) {
    console.log("There was an error connecting to the database", err);
    process.exit(1);
  }
}
connectDB();

async function importData() {
  try {
    // #region agent log
    const logPath = require("path").join(
      __dirname,
      "..",
      "..",
      ".cursor",
      "debug.log"
    );
    try {
      fs.appendFileSync(
        logPath,
        JSON.stringify({
          location: "importdata.js:importData",
          message: "Import products from JSON (overwrites DB)",
          data: { productCount: productsdata.products?.length },
          timestamp: Date.now(),
          sessionId: "debug-session",
          hypothesisId: "H1",
        }) + "\n"
      );
    } catch (_) {}
    // #endregion
    await Product.create(productsdata.products);
    console.log("data successfully imported to the db");
    process.exit();
  } catch (err) {
    console.log("There was an error importing data", err);
    process.exit(1);
  }
}

async function deleteData() {
  try {
    // #region agent log
    const logPath = require("path").join(
      __dirname,
      "..",
      "..",
      ".cursor",
      "debug.log"
    );
    try {
      require("fs").appendFileSync(
        logPath,
        JSON.stringify({
          location: "importdata.js:deleteData",
          message: "Delete all products from DB",
          data: {},
          timestamp: Date.now(),
          sessionId: "debug-session",
          hypothesisId: "H1",
        }) + "\n"
      );
    } catch (_) {}
    // #endregion
    await Product.deleteMany();
    console.log("Data was successfully deleted");
    process.exit();
  } catch (err) {
    console.log("There was an error deleting data", err);
    process.exit(1);
  }
}

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
