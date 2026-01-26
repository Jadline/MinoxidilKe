const express = require('express')

const { sendContactEmail } = require('../controllers/emailController')

const router = express.Router()

// Health check endpoint for email service
router.get('/health', (req, res) => {
  const hasEmailUser = !!process.env.EMAIL_USER;
  const hasEmailPass = !!process.env.EMAIL_PASS;
  const hasAdminEmail = !!process.env.ADMIN_EMAIL;
  
  res.status(200).json({
    status: 'success',
    emailService: {
      configured: hasEmailUser && hasEmailPass,
      hasEmailUser,
      hasEmailPass,
      hasAdminEmail,
      emailUser: process.env.EMAIL_USER || 'not set',
      adminEmail: process.env.ADMIN_EMAIL || 'not set',
    },
  });
});

router.route('/').post(sendContactEmail)

module.exports = router