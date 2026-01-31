const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadPackageImage, ensureUploadDir } = require('../controllers/uploadController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'packages');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpe?g|png|webp|gif)$/i.test(file.originalname) || file.mimetype?.startsWith('image/');
    if (allowed) cb(null, true);
    else cb(new Error('Only image files (jpg, png, webp, gif) are allowed.'), false);
  },
});

router.post(
  '/package',
  authMiddleware,
  requireRole(['admin']),
  upload.single('image'),
  (err, req, res, next) => {
    if (err) {
      return res.status(400).json({ status: 'fail', message: err.message || 'Invalid file.' });
    }
    next();
  },
  uploadPackageImage
);

module.exports = router;
