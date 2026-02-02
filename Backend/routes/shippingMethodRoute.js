const express = require('express');
const {
  getShippingMethods,
  getAllShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
} = require('../controllers/shippingMethodController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public: list shipping methods by country (and optional city/region)
router.get('/', getShippingMethods);

// Admin: list all shipping methods
router.get('/admin', authMiddleware, requireRole(['admin']), getAllShippingMethods);

// Admin: create / update / delete
router.post('/', authMiddleware, requireRole(['admin']), createShippingMethod);
router.patch('/:id', authMiddleware, requireRole(['admin']), updateShippingMethod);
router.delete('/:id', authMiddleware, requireRole(['admin']), deleteShippingMethod);

module.exports = router;
