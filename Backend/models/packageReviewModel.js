const mongoose = require('mongoose');

const packageReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    packageId: {
      type: Number,
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

packageReviewSchema.index({ user: 1, packageId: 1 }, { unique: true });

module.exports = mongoose.model('PackageReview', packageReviewSchema);
