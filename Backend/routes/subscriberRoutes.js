const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  exportSubscribers,
  getSubscriberCount,
} = require('../controllers/subscriberController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/', authMiddleware, requireRole(['admin']), getAllSubscribers);
router.get('/export', authMiddleware, requireRole(['admin']), exportSubscribers);
router.get('/count', authMiddleware, requireRole(['admin']), getSubscriberCount);

module.exports = router;
