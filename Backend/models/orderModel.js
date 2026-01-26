const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  trackingNumber: String,
  orderItems: [
    {
      id: Number,
      name: String,
      description: String,
      leadTime: String,
      price: Number,
      quantity: { type: Number, default: 1 },
      imageSrc: String,
      imageAlt: String,
      inStock: Boolean,
    },
  ],
  shippingCost: Number,
  city: String,
  Total: Number,
  OrderTotal: Number,
  email: String,
  date: { type: Date, default: Date.now },
  paymentType: String,
  mpesaDetails: String,
  paymentStatus: { type: String, enum: ['pending', 'succeeded', 'failed', 'unpaid'], default: 'pending' },
});


module.exports = mongoose.model("Order", orderSchema);
