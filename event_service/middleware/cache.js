const redisClient = require('../connections/redis_client').getClient; // Import Redis client


// Cache Middleware
const cacheMiddleware = async (req, res, next) => {
    const { id } = req.params;

    if (!id) return next(); // Skip cache for listing all events

    try {
        const cachedEvent = await redisClient.get(`event:${id}`);
        if (cachedEvent) {
            logger.info(`Cache hit for event ${id}`);
            return res.json(JSON.parse(cachedEvent));
        }
        next();
    } catch (err) {
        logger.error('Error accessing cache:', err.message);
        next();
    }
};

module.exports = cacheMiddleware;