
const Product = require('../models/productModel'); 
const Review = require('../models/reviewModel');

exports.createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    const review = await Review.create({
      user: req.user._id,
      product,
      rating,
      comment,
    });

  
    const populatedReview = await review.populate('user', 'firstName lastName  email');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'firstName lastName email') 
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

