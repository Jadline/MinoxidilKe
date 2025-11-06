const express = require('express');
const  mpesaNotification = require('../controllers/mpesaController');

const router = express.Router();



router.route('/').post(mpesaNotification)




module.exports = router;
