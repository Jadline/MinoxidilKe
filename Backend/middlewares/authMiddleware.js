// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Authenticate request using JWT Bearer token.
 * Attaches req.user (without password).
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists.',
      });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token.',
        code: 'INVALID_TOKEN',
      });
    }
    return res.status(401).json({
      status: 'fail',
      message: 'Authentication failed.',
    });
  }
}

/**
 * Require that the authenticated user has one of the given roles.
 * Must be used after authMiddleware.
 * Example: requireRole(['admin']), requireRole(['admin','support'])
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication required.',
      });
    }
    const userRole = req.user.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
