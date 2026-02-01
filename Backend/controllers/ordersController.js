const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { v4: uuidv4 } = require('uuid');
const { sendOrderConfirmationEmail } = require('./emailController');

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
    const { 
      orderItems, 
      paymentType, 
      phoneNumber, 
      phone: shippingPhone,
      country,
      firstName,
      lastName,
      company,
      apartment,
      city, 
      streetAddress,
      postalCode,
      deliveryInstructions,
      shippingCost,
      deliveryType,
      shippingMethodName,
      pickupLocationName,
      pickupLocationId,
    } = req.body;
    const userId = req.user._id;

    // Validate order items exist
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Order must contain at least one item',
      });
    }

    // Duplicate order prevention: Check for recent identical order (within last 30 seconds)
    const recentOrder = await Order.findOne({
      userId,
      date: { $gte: new Date(Date.now() - 30000) }, // Last 30 seconds
    }).sort({ date: -1 });

    if (recentOrder) {
      // Check if order items are identical
      const recentItemIds = recentOrder.orderItems.map(item => `${item.id}-${item.quantity}`).sort().join(',');
      const currentItemIds = orderItems.map(item => `${item.id}-${item.quantity}`).sort().join(',');
      
      if (recentItemIds === currentItemIds) {
        return res.status(409).json({
          status: 'fail',
          message: 'Duplicate order detected. Please wait a moment before submitting again.',
          orderId: recentOrder._id,
        });
      }
    }

    // Product items have numeric id; package items have string id like "package-1"
    const productIds = orderItems
      .filter((item) => typeof item.id === 'number')
      .map((item) => item.id);
    const products = productIds.length > 0 ? await Product.find({ id: { $in: productIds } }) : [];

    const productMap = {};
    products.forEach((product) => {
      productMap[product.id] = product;
    });

    let recalculatedTotal = 0;
    const validatedOrderItems = [];

    for (const item of orderItems) {
      const isPackage = typeof item.id === 'string' && item.id.startsWith('package-');
      if (isPackage) {
        // Package line item: accept as-is (name, price, quantity from client)
        const price = Number(item.price) >= 0 ? Number(item.price) : 0;
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        validatedOrderItems.push({
          id: item.id,
          name: item.name || 'Package',
          description: item.description || '',
          leadTime: item.leadTime || '',
          price,
          quantity: qty,
          imageSrc: item.imageSrc || '',
          imageAlt: item.imageAlt || '',
          inStock: true,
        });
        recalculatedTotal += price * qty;
        continue;
      }

      const productId = typeof item.id === 'number' ? item.id : parseInt(item.id, 10);
      const product = productMap[productId];

      if (!product) {
        return res.status(400).json({
          status: 'fail',
          message: `Product with ID ${item.id} not found`,
        });
      }

      if (!product.inStock) {
        return res.status(400).json({
          status: 'fail',
          message: `Product "${product.name}" is out of stock`,
        });
      }

      // Use server-side price (prevent price manipulation)
      const itemPrice = product.price;
      const quantity = item.quantity || 1;
      const itemTotal = itemPrice * quantity;

      recalculatedTotal += itemTotal;

      validatedOrderItems.push({
        id: product.id,
        name: product.name,
        description: product.description || '',
        leadTime: product.leadTime || '',
        price: itemPrice, // Server-validated price
        quantity: quantity,
        imageSrc: product.imageSrc || '',
        imageAlt: product.imageAlt || '',
        inStock: product.inStock,
      });
    }

    // Recalculate totals on server
    const recalculatedSubtotal = recalculatedTotal;
    const isPickup = deliveryType === 'pickup';
    const recalculatedShippingCost = isPickup ? 0 : (Number(shippingCost) || 0);
    const recalculatedOrderTotal = recalculatedSubtotal + recalculatedShippingCost;

    // Generate order number on server (secure, unique)
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0].toUpperCase();
    const orderNumber = `ORD-${timestamp}-${uniqueId}`;
    
    // Generate tracking number
    const trackingNumber = `TRK-${timestamp}-${uniqueId}`;

    // Create order with validated data
    const orderData = {
      orderNumber,
      trackingNumber,
      orderItems: validatedOrderItems,
      deliveryType: deliveryType || 'ship',
      shippingMethodName: shippingMethodName || null,
      shippingCost: recalculatedShippingCost,
      pickupLocationName: pickupLocationName || null,
      pickupLocationId: pickupLocationId || null,
      country: country || '',
      firstName: firstName || '',
      lastName: lastName || '',
      company: company || '',
      streetAddress: streetAddress || '',
      apartment: apartment || '',
      city: city || '',
      postalCode: postalCode || null,
      shippingPhone: shippingPhone || '',
      deliveryInstructions: deliveryInstructions || null,
      phoneNumber: phoneNumber || '',
      Total: recalculatedSubtotal,
      OrderTotal: recalculatedOrderTotal,
      paymentType: paymentType || 'pay-on-delivery',
      mpesaDetails: req.body.mpesaNumber || null,
      paymentStatus: paymentType === 'mpesa' ? 'pending' : 'unpaid',
      userId: req.user._id,
      email: req.user.email,
      date: new Date(),
    };

    const order = await Order.create(orderData);

    // Send order confirmation email (non-blocking - don't fail order if email fails)
    sendOrderConfirmationEmail(order).catch((emailError) => {
      console.error('Failed to send order confirmation email:', emailError);
      // Email failure doesn't affect order creation
    });

    res.status(201).json({
      status: 'success',
      message: 'Order added successfully',
      data: { order },
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Failed to create order',
    });
  }
}

module.exports = { getAllOrders, addOrder };
