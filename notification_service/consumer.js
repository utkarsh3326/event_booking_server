// consumer.js
const amqp = require('amqplib');
const sendEmail = require('./emailService');
const { RABBITMQ_URL } = require('./config');
const logger = require('./utils/logger');

const startConsumer = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('email_notifications', { durable: true });

    console.log('Waiting for messages in email_notifications queue...');
    channel.consume('email_notifications', async (msg) => {
      if (msg !== null) {
        const { userId, eventId, seats, type } = JSON.parse(msg.content.toString());
        const subject = type === 'booking_confirmation' ? 'Booking Confirmation' : 'Booking Cancellation';
        const text = type === 'booking_confirmation'
          ? `Your booking for event ${eventId} with ${seats} seats has been confirmed.`
          : `Your booking for event ${eventId} with ${seats} seats has been cancelled.`;

        // Fetch user email (assuming a function getUserEmail exists)
        const userEmail = 'user@example.com'; // Replace with actual user email lookup
        try {
          await sendEmail(userEmail, subject, text);
        } catch (err) {
          logger.error('Error sending email:', err.message);
        }
        channel.ack(msg);
      }
    });
  } catch (err) {
    logger.error('Error starting consumer:', err.message);
    process.exit(1);
  }
};

startConsumer();
