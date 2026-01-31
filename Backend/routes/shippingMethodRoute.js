const express = require('express');
const { getShippingMethods } = require('../controllers/shippingMethodController');

const router = express.Router();
router.get('/', getShippingMethods);

module.exports = router;
