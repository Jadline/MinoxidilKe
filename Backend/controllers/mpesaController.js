const Order = require('../models/orderModel'); 

async function mpesaNotification(req, res) {
  try {
    const { phone, description, orderNumber } = req.body;

    if (!phone || !orderNumber) {
      return res.status(400).json({ error: "Missing phone or order number" });
    }

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

  
    order.mpesaDetails = { phone, description };
    order.paymentStatus = "pending"; 
    await order.save();

    res.json({ message: "Payment notification received" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = mpesaNotification