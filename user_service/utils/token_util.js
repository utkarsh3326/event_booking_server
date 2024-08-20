const jwt = require('jsonwebtoken');
const logger = require('./logger');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN_EXPIRE } = require('../config');

const generateAccessToken = (userId) => {
  try {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE });
  } catch (error) {
    logger.error('Error generating access token:', error.message);
    throw error;
  }
};

const generateRefreshToken = (userId) => {
  try {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
  } catch (error) {
    logger.error('Error generating refresh token:', error.message);
    throw error;
  }
};

const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        logger.error('Token verification failed:', err.message);
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
