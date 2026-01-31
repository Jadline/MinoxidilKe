const mongoose = require('mongoose');

const shippingMethodSchema = new mongoose.Schema({
  country: { type: String, required: true, trim: true }, // e.g. "Kenya", "Uganda", "Tanzania"
  region: { type: String, trim: true }, // e.g. "Nairobi", "Central", "Kampala"
  city: { type: String, trim: true }, // optional: specific city name for display
  name: { type: String, required: true, trim: true }, // e.g. "Nairobi CBD", "Uganda - Mash Poa"
  description: { type: String, trim: true }, // e.g. "CBD", "Around Nairobi"
  costKes: { type: Number, required: true, min: 0 },
  sortOrder: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ShippingMethod', shippingMethodSchema);
