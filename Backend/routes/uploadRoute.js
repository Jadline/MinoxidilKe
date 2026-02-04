const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadPackageImage, uploadProductImage, ensureUploadDir } = require('../controllers/uploadController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

const packageDir = path.join(__dirname, '..', 'public', 'uploads', 'packages');
const productDir = path.join(__dirname, '..', 'public', 'uploads', 'products');
[packageDir, productDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function createStorage(destDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      ensureUploadDir(destDir);
      cb(null, destDir);
    },
    filename: (req, file, cb) => {
      // Use basename so Windows paths (C:\fakepath\image.png) still yield correct extension
      const baseName = path.basename(file.originalname || '');
      const ext = path.extname(baseName) || '.jpg';
      const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
      cb(null, safeName);
    },
  });
}

const imageFilter = (req, file, cb) => {
  const name = path.basename(file.originalname || '');
  const allowed = /\.(jpe?g|png|webp|gif)$/i.test(name) || file.mimetype?.startsWith('image/');
  if (allowed) cb(null, true);
  else cb(new Error('Only image files (jpg, png, webp, gif) are allowed.'), false);
};

const uploadPackage = multer({
  storage: createStorage(packageDir),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadProduct = multer({
  storage: createStorage(productDir),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const handleMulterError = (err, req, res, next) => {
  if (err) return res.status(400).json({ status: 'fail', message: err.message || 'Invalid file.' });
  next();
};

router.post('/package', authMiddleware, requireRole(['admin']), uploadPackage.single('image'), handleMulterError, uploadPackageImage);
router.post('/product', authMiddleware, requireRole(['admin']), uploadProduct.single('image'), handleMulterError, uploadProductImage);

module.exports = router;
