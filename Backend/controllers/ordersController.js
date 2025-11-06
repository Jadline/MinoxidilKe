const Order = require('../models/orderModel');
const Product = require('../models/productModel');

async function getAllOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.user._id }); // match field in schema
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
}

async function addOrder(req, res) {
  try {
    console.log("🟢 Received order body:", req.body);

    const orderData = {
      ...req.body,
      userId: req.user._id,  
      email: req.user.email, 
      paymentStatus: req.body.paymentType === "mpesa" ? "pending" : "unpaid",
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      status: 'success',
      data: { order },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
}


module.exports = { getAllOrders, addOrder };
