const mongoose = require('mongoose');

const pickupLocationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "Jubilee Exchange building, Kaunda Street (CBD)"
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  distanceKm: { type: Number }, // optional, for "X km" display
  readinessText: { type: String, default: 'Usually ready in 24 hours' },
  costKes: { type: Number, default: 0 }, // 0 = FREE
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('PickupLocation', pickupLocationSchema);
