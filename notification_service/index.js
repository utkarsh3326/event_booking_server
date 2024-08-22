// index.js
const startConsumer = require('./consumer');
const logger = require('./utils/logger');

// Start the consumer
startConsumer().then(() => {
    logger.info('Notification service is up and running, waiting for messages...');
}).catch((err) => {
    logger.error('Failed to start Notification service:', err.message);
    process.exit(1); // Exit the process with an error code
});
