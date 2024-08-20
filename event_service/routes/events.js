const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const redisClient = require('../connections/redis_client').getClient; // Import Redis client
const logger = require('../utils/logger');
const authenticateToken = require('../middleware/auth');
const { rateLimitMiddleware } = require('../middleware/ratelimiter');
const cacheMiddleware = require('../middleware/cache');


// Create a new event
router.post('/', authenticateToken, rateLimitMiddleware, async (req, res) => {
    const { name, description, date, location, totalSeats } = req.body;

    if (!name || !date || !location || totalSeats === undefined) {
        logger.warn('Missing required fields in event creation request');
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const event = new Event({ name, description, date, location, totalSeats, availableSeats: totalSeats });
        await event.save();
        logger.info(`Event created: ${name}`);
        redisClient.del('events'); // Invalidate cache for events list
        res.status(201).json(event);
    } catch (err) {
        logger.error('Error creating event:', err.message);
        res.status(500).json({ message: 'Error creating event', error: err });
    }
});

// Get all events
router.get('/', rateLimitMiddleware, async (req, res) => {
    try {
        const cachedEvents = await redisClient.get('events');
        if (cachedEvents) {
            logger.info('Cache hit for all events');
            return res.json(JSON.parse(cachedEvents));
        }

        const events = await Event.find();
        redisClient.set('events', JSON.stringify(events), 'EX', 60); // Cache for 1 minute
        logger.info('Cache miss for all events');
        res.json(events);
    } catch (err) {
        logger.error('Error retrieving events:', err.message);
        res.status(500).json({ message: 'Error retrieving events', error: err.message });
    }
});

// Get event by ID
router.get('/:id', rateLimitMiddleware, cacheMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id);
        if (!event) {
            logger.warn(`Event not found: ${id}`);
            return res.status(404).json({ message: 'Event not found' });
        }
        redisClient.set(`event:${id}`, JSON.stringify(event), 'EX', 60); // Cache for 1 minute
        logger.info(`Retrieved event: ${id}`);
        res.json(event);
    } catch (err) {
        logger.error('Error retrieving event:', err.message);
        res.status(500).json({ message: 'Error retrieving event', error: err.message });
    }
});

// Update an event
router.put('/:id', authenticateToken, rateLimitMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, description, date, location, totalSeats, availableSeats } = req.body;

    try {
        const event = await Event.findById(id);
        if (!event) {
            logger.warn(`Event not found for update: ${id}`);
            return res.status(404).json({ message: 'Event not found' });
        }
        if (name) event.name = name;
        if (description) event.description = description;
        if (date) event.date = date;
        if (location) event.location = location;
        if (totalSeats !== undefined) event.totalSeats = totalSeats;
        if (availableSeats !== undefined) event.availableSeats = availableSeats;

        await event.save();
        redisClient.del('events'); // Invalidate cache for events list
        redisClient.del(`event:${id}`); // Invalidate cache for individual event
        logger.info(`Event updated: ${id}`);
        res.json(event);
    } catch (err) {
        logger.error('Error updating event:', err.message);
        res.status(500).json({ message: 'Error updating event', error: err.message });
    }
});

// Delete an event
router.delete('/:id', authenticateToken, rateLimitMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            logger.warn(`Event not found for deletion: ${id}`);
            return res.status(404).json({ message: 'Event not found' });
        }
        redisClient.del('events'); // Invalidate cache for events list
        redisClient.del(`event:${id}`); // Invalidate cache for individual event
        logger.info(`Event deleted: ${id}`);
        res.status(204).send();
    } catch (err) {
        logger.error('Error deleting event:', err.message);
        res.status(500).json({ message: 'Error deleting event', error: err.message });
    }
});

module.exports = router;
