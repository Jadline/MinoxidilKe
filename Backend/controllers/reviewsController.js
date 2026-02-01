const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Review = require('../models/reviewModel');
const ProductCache = require('../models/productCacheModel');

exports.createReview = async (req, res) => {
  try {
    const { product: productId, rating, comment } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product is required.' });
    }
    if (rating == null || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required.' });
    }

    const productObjId = mongoose.Types.ObjectId.isValid(productId) ? new mongoose.Types.ObjectId(productId) : null;
    if (!productObjId) {
      return res.status(400).json({ message: 'Invalid product.' });
    }

    const existing = await Review.findOne({ user: req.user._id, product: productObjId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productObjId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    const populatedReview = await review.populate('user', 'firstName lastName email');

    // Recalculate average rating for the product and update Product.rating
    const agg = await Review.aggregate([
      { $match: { product: productObjId } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const avgRating = agg[0]?.avg ?? 0;
    const rounded = Math.round(avgRating * 10) / 10; // one decimal
    await Product.findByIdAndUpdate(productObjId, { $set: { rating: rounded } });

    // Clear product list cache so admin/shop lists show updated rating (uses ProductCache here to avoid requiring productController)
    try {
      await ProductCache.deleteMany({ key: /^products:/ });
    } catch (cacheErr) {
      console.error('Product cache invalidation (after review):', cacheErr.message);
    }

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }
    res.status(400).json({ message: error.message || 'Failed to create review.' });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product.' });
    }

    const reviews = await Review.find({ product: productId })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch reviews.' });
  }
};

