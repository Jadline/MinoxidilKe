const express = require('express')
const {getAllOrders,addOrder} = require('../controllers/ordersController')
const authMiddleware = require('../middlewares/authMiddleware')
const validateOrder = require('../middlewares/validateOrder')

const router = express.Router()


router.route('/')
    .get(authMiddleware,getAllOrders)
    .post(authMiddleware,validateOrder,addOrder)

module.exports = router;