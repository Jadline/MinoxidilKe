const mongoose = require('mongoose');

const detailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [String],
});

const PackageSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: { type: String, default: '' },
  imageSrc: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  /** Product ids (numeric) included in this package */
  productIds: [{ type: Number, required: true }],
  /** Bundle price in KSh */
  bundlePrice: { type: Number, required: true, min: 0 },
  quantityLabel: { type: String, default: '1 pack' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  inStock: { type: Boolean, default: true },
  category: { type: String, default: '' },
  leadTime: { type: String, default: '' },
  /** Expandable sections (e.g. Features) - same shape as product details */
  details: [detailSchema],
});

PackageSchema.index({ name: 1 });

const Package = mongoose.model('Package', PackageSchema);
module.exports = Package;
