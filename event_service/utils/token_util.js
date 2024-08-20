const jwt = require('jsonwebtoken');
const logger = require('./logger');

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
  verifyToken,
};
