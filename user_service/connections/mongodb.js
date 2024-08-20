const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { MONGO_URI } = require('../config');

let isConnected = false; // Track connection status

const connectToMongoDB = async () => {
  if (isConnected) return; // Avoid multiple connections

  try {
    await mongoose.connect(MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    isConnected = true;
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('Error connecting to MongoDB:', err.message);
    throw err;
  }
};

const disconnectFromMongoDB = async () => {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('Disconnected from MongoDB');
  } catch (err) {
    logger.error('Error disconnecting from MongoDB:', err.message);
    throw err;
  }
};

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB,
};
