const jwt = require('jsonwebtoken');

function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from .env');
  }

  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

module.exports = generateToken;

