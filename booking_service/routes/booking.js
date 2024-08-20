// routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const redisClient = require('../redisClient').getClient();
const rabbitmqClient = require('../rabbitmqClient').getChannel();
const logger = require('../utils/logger');
const { RateLimiterRedis } = require('rate-limiter-flexible');

// Rate Limiter Setup
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 5,
  duration: 60,
  blockDuration: 30,
});

// Middleware for rate limiting
const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (err) {
    logger.warn('Rate limit exceeded:', req.ip);
    res.status(429).json({ message: 'Too many requests' });
  }
};

// Book tickets for an event
router.post('/bookings', rateLimitMiddleware, async (req, res) => {
  const { userId, eventId, seats } = req.body;

  if (!userId || !eventId || !seats) {
    logger.warn('Missing required fields in booking request');
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      logger.warn('Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableSeats < seats) {
      logger.warn('Not enough seats available');
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    event.availableSeats -= seats;
    await event.save();

    const booking = new Booking({ userId, eventId, seats });
    await booking.save();

    // Send notification
    rabbitmqClient.sendToQueue('email_notifications', Buffer.from(JSON.stringify({
      userId,
      eventId,
      seats,
      type: 'booking_confirmation',
    })));

    logger.info(`Booking created for user ${userId} for event ${eventId}`);
    res.status(201).json({ message: 'Booking created successfully' });
  } catch (err) {
    logger.error('Error creating booking:', err.message);
    res.status(500).json({ message: 'Error creating booking', error: err.message });
  }
});

// Get details of a booking
router.get('/bookings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      logger.warn('Booking not found');
      return res.status(404).json({ message: 'Booking not found' });
    }

    logger.info(`Booking details retrieved for booking ${id}`);
    res.json(booking);
  } catch (err) {
    logger.error('Error retrieving booking:', err.message);
    res.status(500).json({ message: 'Error retrieving booking', error: err.message });
  }
});

// Cancel a booking
router.delete('/bookings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      logger.warn('Booking not found');
      return res.status(404).json({ message: 'Booking not found' });
    }

    const event = await Event.findById(booking.eventId);
    if (event) {
      event.availableSeats += booking.seats;
      await event.save();
    }

    await Booking.findByIdAndDelete(id);

    // Send notification
    rabbitmqClient.sendToQueue('email_notifications', Buffer.from(JSON.stringify({
      userId: booking.userId,
      eventId: booking.eventId,
      seats: booking.seats,
      type: 'booking_cancellation',
    })));

    logger.info(`Booking ${id} cancelled successfully`);
    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    logger.error('Error cancelling booking:', err.message);
    res.status(500).json({ message: 'Error cancelling booking', error: err.message });
  }
});

module.exports = router;
