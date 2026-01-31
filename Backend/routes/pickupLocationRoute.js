const express = require('express');
const { getPickupLocations } = require('../controllers/pickupLocationController');

const router = express.Router();
router.get('/', getPickupLocations);

module.exports = router;
