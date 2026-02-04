const path = require("path");
const fs = require("fs");

const PACKAGE_UPLOAD_DIR = path.join(
  __dirname,
  "..",
  "public",
  "uploads",
  "packages"
);
const PRODUCT_UPLOAD_DIR = path.join(
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

function publicPathFromFile(file, folder) {
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
    ensureUploadDir(PACKAGE_UPLOAD_DIR);
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "No image file provided." });
    }
    const publicPath = publicPathFromFile(req.file, "packages");
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
    ensureUploadDir(PRODUCT_UPLOAD_DIR);
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "No image file provided." });
    }
    // Ensure file was actually written to disk (multer.diskStorage writes before this runs)
    const filePath = req.file.path;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(500).json({
        status: "fail",
        message: "Image could not be saved to the server. Please try again.",
      });
    }
    const publicPath = publicPathFromFile(req.file, "products");
    res.status(200).json({ status: "success", data: { path: publicPath } });
  } catch (err) {
    res
      .status(500)
      .json({ status: "fail", message: err.message || "Upload failed." });
  }
}

module.exports = { uploadPackageImage, uploadProductImage, ensureUploadDir };
