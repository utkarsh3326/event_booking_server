// rabbitmqClient.js
const amqp = require('amqplib');
const { RABBITMQ_URL } = require('../config');
const logger = require('../utils/logger');

let channel;
let connection;

const connectToRabbitMQ = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    logger.info('Connected to RabbitMQ');
    await channel.assertQueue('email_notifications', { durable: true });
  } catch (err) {
    logger.error('Error connecting to RabbitMQ:', err);
    throw err;
  }
};

const disconnectFromRabbitMQ = async () => {
  try {
    await channel.close();
    await connection.close();
    logger.info('Disconnected from RabbitMQ');
  } catch (err) {
    logger.error('Error disconnecting from RabbitMQ:', err.message);
    throw err;
  }
};

module.exports = {
  connectToRabbitMQ,
  disconnectFromRabbitMQ,
  getChannel: () => channel,
};
