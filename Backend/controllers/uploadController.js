const path = require("path");
const fs = require("fs");

// Single source of truth: absolute paths so files are always written under Backend/public/uploads
const PACKAGE_UPLOAD_DIR = path.resolve(
  __dirname,
  "..",
  "public",
  "uploads",
  "packages"
);
const PRODUCT_UPLOAD_DIR = path.resolve(
  __dirname,
  "..",
  "public",
  "uploads",
  "products"
);

function ensureUploadDir(dir = PACKAGE_UPLOAD_DIR) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get public URL/path from uploaded file.
 * - Cloudinary: req.file.path is already the full URL (https://res.cloudinary.com/...)
 * - Disk: req.file.path is local path, convert to /uploads/folder/filename
 */
function getPublicPath(file, folder) {
  // Cloudinary storage sets file.path to the full URL
  if (file.path && file.path.startsWith("http")) {
    return file.path;
  }
  // Disk storage: convert local path to public path
  const pathSegments = file.path.split(path.sep);
  const uploadsIndex = pathSegments.indexOf("uploads");
  return (
    "/" +
    (uploadsIndex >= 0
      ? pathSegments.slice(uploadsIndex)
      : ["uploads", folder, file.filename]
    )
      .join("/")
      .replace(/\\/g, "/")
  );
}

/**
 * POST /api/v1/upload/package
 * Expects multipart field "image". Returns path like /uploads/packages/xxx.jpg
 */
async function uploadPackageImage(req, res) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "No image file provided." });
    }
    const publicPath = getPublicPath(req.file, "packages");
    // #region agent log
    const _debugPayload = {
      location: "uploadController.js:uploadPackageImage",
      message: "Package image uploaded",
      data: {
        path: publicPath,
        filePath: req.file?.path,
        exists: req.file?.path ? fs.existsSync(req.file.path) : false,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "H3",
    };
    try {
      fs.appendFileSync(
        path.join(__dirname, "..", "..", ".cursor", "debug.log"),
        JSON.stringify(_debugPayload) + "\n"
      );
    } catch (_) {}
    fetch("http://127.0.0.1:7242/ingest/9682c5af-2357-4367-999b-d21175ed0f6d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(_debugPayload),
    }).catch(() => {});
    // #endregion
    res.status(200).json({ status: "success", data: { path: publicPath } });
  } catch (err) {
    res
      .status(500)
      .json({ status: "fail", message: err.message || "Upload failed." });
  }
}

/**
 * POST /api/v1/upload/product
 * Expects multipart field "image". Saves to public/uploads/products, returns path like /uploads/products/xxx.jpg
 */
async function uploadProductImage(req, res) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "No image file provided." });
    }
    // For disk storage, verify file was written; for Cloudinary, file.path is URL
    const filePath = req.file.path;
    const isCloudinaryUpload = filePath && filePath.startsWith("http");
    if (!isCloudinaryUpload && (!filePath || !fs.existsSync(filePath))) {
      return res.status(500).json({
        status: "fail",
        message: "Image could not be saved to the server. Please try again.",
      });
    }
    const publicPath = getPublicPath(req.file, "products");
    // #region agent log
    const uploadDirFiles = fs.existsSync(PRODUCT_UPLOAD_DIR) ? fs.readdirSync(PRODUCT_UPLOAD_DIR) : [];
    const _debugPayload = {
      location: "uploadController.js:uploadProductImage",
      message: "Product image uploaded",
      data: {
        path: publicPath,
        filePath: req.file?.path,
        exists: !!(filePath && fs.existsSync(filePath)),
        uploadDirFiles,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "H6",
    };
    try {
      fs.appendFileSync(
        path.join(__dirname, "..", "..", ".cursor", "debug.log"),
        JSON.stringify(_debugPayload) + "\n"
      );
    } catch (_) {}
    fetch("http://127.0.0.1:7242/ingest/9682c5af-2357-4367-999b-d21175ed0f6d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(_debugPayload),
    }).catch(() => {});
    // #endregion
    res.status(200).json({ status: "success", data: { path: publicPath } });
  } catch (err) {
    res
      .status(500)
      .json({ status: "fail", message: err.message || "Upload failed." });
  }
}

module.exports = {
  uploadPackageImage,
  uploadProductImage,
  ensureUploadDir,
  PACKAGE_UPLOAD_DIR,
  PRODUCT_UPLOAD_DIR,
};
