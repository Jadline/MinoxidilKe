const Order = require('../models/orderModel');
const Product = require('../models/productModel');

async function getAllOrders(req, res) {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
}

async function addOrder(req, res) {
  try {
    console.log('Received order body:', req.body);

    const orderData = {
      ...req.body,
      userId: req.user._id,
      email: req.user.email,
      paymentStatus:
        req.body.paymentType === 'mpesa' ? 'pending' : 'unpaid',
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      status: 'success',
      message: 'Order added successfully',
      data: { order },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
}

module.exports = { getAllOrders, addOrder };
