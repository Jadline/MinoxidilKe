const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/emailController');

// Test endpoint to verify email is working
router.post('/test', async (req, res) => {
  // Simulate a contact form submission
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phoneNumber: '0712345678',
    product: 'Test Product',
    message: 'This is a test email to verify Nodemailer is working correctly.',
  };

  // Create a mock request object
  const mockReq = {
    body: testData,
  };

  const mockRes = {
    status: (code) => ({
      json: (data) => {
        console.log('Test email response:', { code, data });
        return res.status(code).json(data);
      },
    }),
  };

  await sendContactEmail(mockReq, mockRes);
});

module.exports = router;
