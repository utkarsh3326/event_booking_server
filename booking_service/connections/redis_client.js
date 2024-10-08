// redisClient.js
const redis = require('redis');
const { REDIS_URL } = require('../config');
const logger = require('../utils/logger');

let redisClient;
let isConnected = false;

const connectToRedis = async () => {
    if (isConnected) return; // Avoid multiple connections

    try {
        redisClient = redis.createClient({ url: REDIS_URL });

        redisClient.on('error', (err) => {
            logger.error('Redis error:', err.message);
        });

        redisClient.on('ready', () => {
            logger.info('Connected to Redis');
            isConnected = true;
        });

        redisClient.on('end', () => {
            logger.info('Disconnected from Redis');
            isConnected = false;
        });

        // Wait for the client to connect
        await redisClient.connect();

    } catch (err) {
        logger.error('Error connecting to Redis:', err.message);
        throw err;
    }
};

const disconnectFromRedis = async () => {
    if (!isConnected) return;

    try {
        await redisClient.quit();
        isConnected = false;
    } catch (err) {
        logger.error('Error disconnecting from Redis:', err.message);
        throw err;
    }
};

const getClient = () => {
    if (!redisClient) {
        throw new Error('Redis client is not initialized');
    }
    return redisClient;
};


module.exports = {
    connectToRedis,
    disconnectFromRedis,
    getClient,
};
