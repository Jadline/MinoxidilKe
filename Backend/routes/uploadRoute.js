const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  uploadPackageImage,
  uploadProductImage,
  ensureUploadDir,
  PACKAGE_UPLOAD_DIR,
  PRODUCT_UPLOAD_DIR,
} = require("../controllers/uploadController");
const {
  authMiddleware,
  requireRole,
} = require("../middlewares/authMiddleware");
const {
  isCloudinaryConfigured,
  createCloudinaryStorage,
} = require("../utils/cloudinaryConfig");

const router = express.Router();

// Use same absolute paths as controller so files are always written to Backend/public/uploads/*
[PACKAGE_UPLOAD_DIR, PRODUCT_UPLOAD_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function createDiskStorage(destDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      ensureUploadDir(destDir);
      cb(null, destDir); // destDir is absolute (PRODUCT_UPLOAD_DIR / PACKAGE_UPLOAD_DIR)
    },
    filename: (req, file, cb) => {
      // Use basename so Windows paths (C:\fakepath\image.png) still yield correct extension
      const baseName = path.basename(file.originalname || "");
      const ext = path.extname(baseName) || ".jpg";
      const safeName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
      cb(null, safeName);
    },
  });
}

const imageFilter = (req, file, cb) => {
  const name = path.basename(file.originalname || "");
  const allowed =
    /\.(jpe?g|png|webp|gif)$/i.test(name) ||
    file.mimetype?.startsWith("image/");
  if (allowed) cb(null, true);
  else
    cb(new Error("Only image files (jpg, png, webp, gif) are allowed."), false);
};

// Use Cloudinary storage if configured, otherwise fall back to disk
const uploadPackage = multer({
  storage: isCloudinaryConfigured
    ? createCloudinaryStorage("packages")
    : createDiskStorage(PACKAGE_UPLOAD_DIR),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadProduct = multer({
  storage: isCloudinaryConfigured
    ? createCloudinaryStorage("products")
    : createDiskStorage(PRODUCT_UPLOAD_DIR),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const handleMulterError = (err, req, res, next) => {
  if (err)
    return res
      .status(400)
      .json({ status: "fail", message: err.message || "Invalid file." });
  next();
};

router.post(
  "/package",
  authMiddleware,
  requireRole(["admin"]),
  uploadPackage.single("image"),
  handleMulterError,
  uploadPackageImage
);
router.post(
  "/product",
  authMiddleware,
  requireRole(["admin"]),
  uploadProduct.single("image"),
  handleMulterError,
  uploadProductImage
);

module.exports = router;
