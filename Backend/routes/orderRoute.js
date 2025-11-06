const express = require('express')
const {getAllOrders,addOrder} = require('../controllers/ordersController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router()


router.route('/')
    .get(authMiddleware,getAllOrders)
    .post(authMiddleware,addOrder)

module.exports = router;