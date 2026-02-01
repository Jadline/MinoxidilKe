const Package = require('../models/packageModel');
const PackageReview = require('../models/packageReviewModel');

exports.createPackageReview = async (req, res) => {
  try {
    const { package: packageId, rating, comment } = req.body;

    if (packageId == null || packageId === '') {
      return res.status(400).json({ message: 'Package is required.' });
    }
    const pkgId = Number(packageId);
    if (!Number.isInteger(pkgId) || pkgId < 1) {
      return res.status(400).json({ message: 'Invalid package.' });
    }
    if (rating == null || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required.' });
    }

    const existing = await PackageReview.findOne({
      user: req.user._id,
      packageId: pkgId,
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this package.' });
    }

    const review = await PackageReview.create({
      user: req.user._id,
      packageId: pkgId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    const populatedReview = await review.populate('user', 'firstName lastName email');

    const agg = await PackageReview.aggregate([
      { $match: { packageId: pkgId } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const avgRating = agg[0]?.avg ?? 0;
    const rounded = Math.round(avgRating * 10) / 10;
    await Package.findOneAndUpdate({ id: pkgId }, { $set: { rating: rounded } });

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this package.' });
    }
    res.status(400).json({ message: error.message || 'Failed to create review.' });
  }
};

exports.getReviewsByPackage = async (req, res) => {
  try {
    const packageId = Number(req.params.packageId);
    if (!Number.isInteger(packageId) || packageId < 1) {
      return res.status(400).json({ message: 'Invalid package.' });
    }

    const reviews = await PackageReview.find({ packageId })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch reviews.' });
  }
};
