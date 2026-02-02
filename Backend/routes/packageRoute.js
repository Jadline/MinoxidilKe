const express = require('express');
const {
  getPackageCategories,
  fetchAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/categories', getPackageCategories);
router.route('/').get(fetchAllPackages).post(authMiddleware, requireRole(['admin']), createPackage);
router
  .route('/:id')
  .get(getPackageById)
  .patch(authMiddleware, requireRole(['admin']), updatePackage)
  .delete(authMiddleware, requireRole(['admin']), deletePackage);

module.exports = router;
