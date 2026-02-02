const express = require('express');
const {
  getPickupLocations,
  getAllPickupLocations,
  createPickupLocation,
  updatePickupLocation,
  deletePickupLocation,
} = require('../controllers/pickupLocationController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public: list active pickup locations (filter by country/city)
router.get('/', getPickupLocations);

// Admin: list all pickup locations
router.get('/admin', authMiddleware, requireRole(['admin']), getAllPickupLocations);

// Admin: create / update / delete
router.post('/', authMiddleware, requireRole(['admin']), createPickupLocation);
router.patch('/:id', authMiddleware, requireRole(['admin']), updatePickupLocation);
router.delete('/:id', authMiddleware, requireRole(['admin']), deletePickupLocation);

module.exports = router;
