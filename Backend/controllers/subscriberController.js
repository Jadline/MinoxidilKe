const Subscriber = require('../models/subscriberModel');

// Subscribe to newsletter (public)
async function subscribe(req, res) {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid email address',
      });
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (existing) {
      if (existing.isActive) {
        return res.status(200).json({
          status: 'success',
          message: 'You are already subscribed!',
        });
      } else {
        // Reactivate subscription
        existing.isActive = true;
        existing.unsubscribedAt = null;
        existing.subscribedAt = new Date();
        await existing.save();
        
        return res.status(200).json({
          status: 'success',
          message: 'Welcome back! Your subscription has been reactivated.',
        });
      }
    }

    await Subscriber.create({ email: email.toLowerCase() });

    res.status(201).json({
      status: 'success',
      message: 'Thanks for subscribing! You\'ll receive our latest updates.',
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to subscribe. Please try again.',
    });
  }
}

// Unsubscribe (public - could be used with unsubscribe link)
async function unsubscribe(req, res) {
  try {
    const { email } = req.body;

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return res.status(404).json({
        status: 'fail',
        message: 'Email not found in our subscriber list',
      });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.status(200).json({
      status: 'success',
      message: 'You have been unsubscribed successfully',
    });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to unsubscribe',
    });
  }
}

// Get all subscribers (admin only)
async function getAllSubscribers(req, res) {
  try {
    const { active, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';

    const subscribers = await Subscriber.find(filter)
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Subscriber.countDocuments(filter);
    const activeCount = await Subscriber.countDocuments({ isActive: true });

    res.status(200).json({
      status: 'success',
      data: {
        subscribers,
        stats: {
          total,
          active: activeCount,
          inactive: total - activeCount,
        },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error('Get subscribers error:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to fetch subscribers',
    });
  }
}

// Export subscribers as CSV (admin only)
async function exportSubscribers(req, res) {
  try {
    const subscribers = await Subscriber.find({ isActive: true })
      .select('email subscribedAt')
      .sort({ subscribedAt: -1 })
      .lean();

    const csv = ['Email,Subscribed Date'];
    subscribers.forEach(s => {
      csv.push(`${s.email},${new Date(s.subscribedAt).toISOString()}`);
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
    res.status(200).send(csv.join('\n'));
  } catch (err) {
    console.error('Export subscribers error:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to export subscribers',
    });
  }
}

// Get subscriber count (for admin dashboard)
async function getSubscriberCount(req, res) {
  try {
    const total = await Subscriber.countDocuments();
    const active = await Subscriber.countDocuments({ isActive: true });
    
    res.status(200).json({
      status: 'success',
      data: { total, active },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Failed to get count',
    });
  }
}

module.exports = {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  exportSubscribers,
  getSubscriberCount,
};
