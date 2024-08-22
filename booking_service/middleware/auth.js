const { ACCESS_TOKEN_SECRET } = require('../config');
const { verifyToken } = require('../utils/token_util');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Authorization header missing or invalid');
    return res.sendStatus(401);
  }

  try {
    const decoded = await verifyToken(token, ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    logger.error('Token verification failed:', err.message);
    res.sendStatus(403);
  }
};

module.exports = authenticateToken;
