const express = require('express');
const parseFilters = require('../middlewares/parseFilters');
const {
  fetchAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public: list products
router.route('/').get(parseFilters, fetchAllProducts);

// Admin-only: create product
router.route('/').post(authMiddleware, requireRole(['admin']), createProduct);

// Public: get one product by id; admin-only: update/delete
router
  .route('/:id')
  .get(getProductById)
  .patch(authMiddleware, requireRole(['admin']), updateProduct)
  .delete(authMiddleware, requireRole(['admin']), deleteProduct);

module.exports = router;