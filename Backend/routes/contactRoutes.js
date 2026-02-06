const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  updateContactStatus,
  deleteContact,
  getUnreadCount,
} = require('../controllers/contactController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// Public route - submit contact form
router.post('/', submitContact);

// Admin routes
router.get('/', authMiddleware, requireRole(['admin']), getAllContacts);
router.get('/unread-count', authMiddleware, requireRole(['admin']), getUnreadCount);
router.patch('/:id/status', authMiddleware, requireRole(['admin']), updateContactStatus);
router.delete('/:id', authMiddleware, requireRole(['admin']), deleteContact);

module.exports = router;
