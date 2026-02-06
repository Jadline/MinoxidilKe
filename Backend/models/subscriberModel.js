const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  unsubscribedAt: {
    type: Date,
    default: null,
  },
});

SubscriberSchema.index({ email: 1 });
SubscriberSchema.index({ subscribedAt: -1 });

const Subscriber = mongoose.model('Subscriber', SubscriberSchema);
module.exports = Subscriber;
