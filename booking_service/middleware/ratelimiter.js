const { RateLimiterRedis } = require('rate-limiter-flexible');
const { getClient } = require('../connections/redis_client');
const logger = require('../utils/logger');

const rateLimitMiddleware = async (req, res, next) => {
    let rateLimiter;

    try {
        const redisClient = getClient(); // Ensure the Redis client is initialized

        if (!redisClient) {
            throw new Error('Redis client is not initialized');
        }

        rateLimiter = new RateLimiterRedis({
            storeClient: redisClient,
            points: 5, // Number of requests
            duration: 60, // Per second
            blockDuration: 30, // Time to block IP for if rate limit is exceeded
        });

        await rateLimiter.consume(req.ip);
        next();
    } catch (err) {
        logger.error('Error from rate limiter:', err);
        logger.warn('Rate limit exceeded:', req.ip);
        res.status(429).json({ message: 'Too many requests' });
    }
};

module.exports = {
    rateLimitMiddleware,
};
