const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const redisClient = require('../redisClient')

async function getAllOrders(req, res) {
  try {
    const userId = req.user._id;
    const cacheKey = `orders:${userId}`

    const cachedOrders = await redisClient.get(cacheKey)

    if(cachedOrders){
      console.log(`Cache hit for user ${userId}`)
      const orders = JSON.parse(cachedOrders)

      return res.status(200).json({
        status : 'success',
        source : 'cache',
        results : orders.length,
        data : {orders},
      })
    }

    const orders = await Order.find({userId});
    await redisClient.setEx(cacheKey,3600,JSON.stringify(orders))

    res.status(200).json({
      status: 'success',
      source : 'db',
      results: orders.length,
      data: { orders },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
}

async function addOrder(req, res) {
  try {
    console.log("Received order body:", req.body);

    const orderData = {
      ...req.body,
      userId: req.user._id,  
      email: req.user.email, 
      paymentStatus: req.body.paymentType === "mpesa" ? "pending" : "unpaid",
    };

    const order = await Order.create(orderData);

    const cacheKey = `orders:${req.user._id}`
    await redisClient.del(cacheKey)

    res.status(201).json({
      status: 'success',
      message : "Order added successfully",
      data: { order },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
}


module.exports = { getAllOrders, addOrder };
