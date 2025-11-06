const express = require('express');
const { registerUrl, stkPush  } = require('../controllers/mpesaController');

const router = express.Router();


router.post('/', registerUrl);


router.post('/confirmation', (req, res) => {
  console.log('Confirmation received:', req.body);
  res.json({ message: 'Confirmation received successfully' });
});

router.post('/validation', (req, res) => {
  console.log('Validation received:', req.body);
  res.json({ message: 'Validation received successfully' });
});

router.post('/stkpush', stkPush);

router.post('/stk_callback', (req, res) => {
  console.log('STK Callback received:', req.body);
  res.json({ message: 'STK callback received successfully' });
});


module.exports = router;
