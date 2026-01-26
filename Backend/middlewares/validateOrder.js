const { body, validationResult } = require('express-validator');

const validateOrder = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('orderItems.*.id')
    .isInt({ min: 1 })
    .withMessage('Invalid product ID'),
  body('orderItems.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('orderItems.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('paymentType')
    .isIn(['mpesa', 'pay-on-delivery'])
    .withMessage('Invalid payment type'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^0\d{9}$|^254\d{9}$/)
    .withMessage('Invalid phone number format'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('streetAddress')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('postalCode')
    .optional()
    .trim(),
  body('deliveryInstructions')
    .optional()
    .trim(),
  body('shippingCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping cost must be a positive number'),
  body('Total')
    .isFloat({ min: 0 })
    .withMessage('Total must be a positive number'),
  body('OrderTotal')
    .isFloat({ min: 0 })
    .withMessage('Order total must be a positive number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = validateOrder;
