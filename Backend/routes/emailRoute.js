const express = require('express')

const sendContactEmail = require('../controllers/emailController')

const router = express.Router()

router.route('/').post(sendContactEmail)

module.exports = router