const { body, validationResult } = require('express-validator');

const validateOrder = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('orderItems.*.id')
    .custom((value) => {
      if (Number.isInteger(value) && value >= 1) return true;
      if (typeof value === 'number' && !Number.isInteger(value)) return false;
      if (typeof value === 'string' && /^package-\d+$/.test(value)) return true;
      if (typeof value === 'string' && /^\d+$/.test(value) && parseInt(value, 10) >= 1) return true;
      throw new Error('Invalid item ID (product number or package-{id})');
    }),
  body('orderItems.*.quantity')
    .custom((val) => {
      const n = Number(val);
      if (!Number.isFinite(n) || n < 1) return false;
      return true;
    })
    .withMessage('Quantity must be at least 1'),
  body('orderItems.*.price')
    .custom((val) => {
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0) return false;
      return true;
    })
    .withMessage('Price must be a positive number'),
  body('paymentType')
    .isIn(['mpesa', 'pay-on-delivery'])
    .withMessage('Invalid payment type'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[0-9]{9,15}$/)
    .withMessage('Invalid phone number (use E.164 or national digits, 9–15 digits)'),
  body('deliveryType')
    .optional()
    .isIn(['ship', 'pickup'])
    .withMessage('Invalid delivery type'),
  body('city')
    .trim()
    .custom((value, { req }) => {
      if (req.body.deliveryType === 'pickup') return true;
      if (!value || !String(value).trim()) throw new Error('City is required for shipping');
      return true;
    }),
  body('streetAddress')
    .trim()
    .custom((value, { req }) => {
      if (req.body.deliveryType === 'pickup') return true;
      if (!value || !String(value).trim()) throw new Error('Street address is required for shipping');
      return true;
    }),
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
  // Total and OrderTotal are calculated server-side; do not require them from the client
  body('Total').optional().isFloat({ min: 0 }).withMessage('Total must be a positive number'),
  body('OrderTotal').optional().isFloat({ min: 0 }).withMessage('Order total must be a positive number'),
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
