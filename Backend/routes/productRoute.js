const express = require('express')
const parseFilters = require('../middlewares/parseFilters')

const fetchAllProducts= require('../controllers/productController')

const router = express.Router()

router
.route('/')
.get(parseFilters,fetchAllProducts)

module.exports = router;