// app.js
const express = require('express');
const mongoose = require('mongoose');
const { connectToRedis, disconnectFromRedis } = require('./redisClient');
const { connectToRabbitMQ, disconnectFromRabbitMQ } = require('./rabbitmqClient');
const bookingsRouter = require('./routes/bookings');
const logger = require('./utils/logger');
const { MONGO_URI, PORT } = require('./config');

const app = express();
app.use(express.json());
app.use('/api', bookingsRouter);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connected to MongoDB');

    await connectToRedis();
    await connectToRabbitMQ();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Error starting server:', err.message);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  await disconnectFromRedis();
  await disconnectFromRabbitMQ();
  mongoose.connection.close();
  process.exit(0);
});
