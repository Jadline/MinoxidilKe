const express = require('express');
const {
  createPackageReview,
  getReviewsByPackage,
} = require('../controllers/packageReviewsController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createPackageReview);
router.get('/:packageId', getReviewsByPackage);

module.exports = router;
