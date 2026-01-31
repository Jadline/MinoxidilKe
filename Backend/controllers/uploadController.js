const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'packages');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * POST /api/v1/upload/package
 * Expects multipart field "image". Returns path like /uploads/packages/xxx.jpg
 * Frontend should set imageSrc = BASE_URL + path (no double slash).
 */
async function uploadPackageImage(req, res) {
  try {
    ensureUploadDir();
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No image file provided.' });
    }
    const pathSegments = req.file.path.split(path.sep);
    const uploadsIndex = pathSegments.indexOf('uploads');
    const publicPath =
      '/' +
      (uploadsIndex >= 0 ? pathSegments.slice(uploadsIndex) : ['uploads', 'packages', req.file.filename])
        .join('/')
        .replace(/\\/g, '/');
    res.status(200).json({
      status: 'success',
      data: { path: publicPath },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message || 'Upload failed.',
    });
  }
}

module.exports = { uploadPackageImage, ensureUploadDir };
