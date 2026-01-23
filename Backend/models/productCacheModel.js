const mongoose = require('mongoose');

const productCacheSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now, expires: 60 }, // TTL in seconds
  },
  {
    collection: 'productCache',
  }
);

const ProductCache = mongoose.model('ProductCache', productCacheSchema);

module.exports = ProductCache;
