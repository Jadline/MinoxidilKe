/**
 * Cloudinary configuration for persistent image storage.
 * Set CLOUDINARY_URL in your environment (Render dashboard) to enable cloud storage.
 * Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
 * 
 * When CLOUDINARY_URL is not set, uploads fall back to local disk storage.
 */
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary auto-configures from CLOUDINARY_URL env var
const isCloudinaryConfigured = !!process.env.CLOUDINARY_URL;

if (isCloudinaryConfigured) {
  console.log("[Cloudinary] Configured - images will be stored in the cloud");
} else {
  console.log("[Cloudinary] Not configured - images will be stored on local disk (ephemeral on Render)");
}

/**
 * Create Cloudinary storage for multer.
 * @param {string} folder - Cloudinary folder name (e.g., "products", "packages")
 */
function createCloudinaryStorage(folder) {
  if (!isCloudinaryConfigured) return null;
  
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `minoxidilke/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [{ width: 1000, height: 1000, crop: "limit", quality: "auto" }],
    },
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  createCloudinaryStorage,
};
