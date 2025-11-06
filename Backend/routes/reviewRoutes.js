const express = require('express');
const { createReview, getReviewsByProduct } = require('../controllers/reviewsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();


router.post('/', authMiddleware, createReview);


router.get('/:productId', getReviewsByProduct);

module.exports = router;
