const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required. Please log in.',
      });
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        message: 'Authentication token is missing',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        message: 'Invalid or expired token. Please log in again.',
      });
    }
    return next(error);
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin permission required.',
    });
  }
  return next();
}

module.exports = {
  protect,
  adminOnly,
};

