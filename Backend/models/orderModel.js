const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  trackingNumber: String,
  orderItems: [
    {
      id: mongoose.Schema.Types.Mixed, // product id (Number) or package cart id (String e.g. "package-1")
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
  deliveryType: { type: String, enum: ['ship', 'pickup'], default: 'ship' },
  shippingMethodName: String,
  shippingCost: Number,
  pickupLocationName: String,
  pickupLocationId: mongoose.Schema.Types.ObjectId,
  country: String,
  firstName: String,
  lastName: String,
  company: String,
  streetAddress: String,
  apartment: String,
  city: String,
  postalCode: String,
  shippingPhone: String,
  deliveryInstructions: String,
  phoneNumber: String,
  Total: Number,
  OrderTotal: Number,
  email: String,
  date: { type: Date, default: Date.now },
  paymentType: String,
  mpesaDetails: String,
  paymentStatus: { type: String, enum: ['pending', 'succeeded', 'failed', 'unpaid'], default: 'pending' },
});


module.exports = mongoose.model("Order", orderSchema);
