const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../connections/redis_client').getClient;
const logger = require('../utils/logger');

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    points: 5, // Number of requests
    duration: 60, // Per second
    blockDuration: 10, // Time to block IP for if rate limit is exceeded
  });


const rateLimitMiddleware = async (req, res, next) => {
  try {
    if (!rateLimiter) {
      throw new Error('Rate limiter is not initialized');
    }
    await rateLimiter.consume(req.ip);
    next();
  } catch (err) {
    logger.warn('Rate limit exceeded:', req.ip);
    res.status(429).json({ message: 'Too many requests' });
  }
};

module.exports = {
  rateLimitMiddleware,
};
