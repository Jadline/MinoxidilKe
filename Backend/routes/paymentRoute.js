const express = require('express');
const router = express.Router();

const  {makePayment,pesapalCallbackHandler} = require('../controllers/paymentController');


router.route('/').post(makePayment)

router.post('/pesapal-callback', pesapalCallbackHandler);



module.exports = router;
