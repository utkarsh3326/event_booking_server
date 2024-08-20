const express = require('express');
const { connectToMongoDB, disconnectFromMongoDB } = require('./connections/mongodb');
const { connectToRedis, disconnectFromRedis } = require('./connections/redis_client');
const userRoutes = require('./routes/users');
const logger = require('./utils/logger');
const { PORT } = require('./config');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send("!! Welcome To User Service !!");
})
app.use('/api/users', userRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Connect to MongoDB and Redis, and start the server
const startServer = async () => {
    try {
        await connectToMongoDB();
        await connectToRedis();
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1); // Exit process with failure
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    await disconnectFromMongoDB();
    await disconnectFromRedis();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await disconnectFromMongoDB();
    await disconnectFromRedis();
    process.exit(0);
});

startServer();
