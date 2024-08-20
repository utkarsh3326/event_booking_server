// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/token_util');
const logger = require('../utils/logger');
const { rateLimitMiddleware } = require('../middleware/ratelimiter');


// Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    logger.warn('Missing username or password in registration request');
    return res.status(400).json({ message: 'Missing username or password' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      logger.warn(`User with username ${username} already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, passwordHash: password });
    await user.save();
    logger.info(`User ${username} registered successfully`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    logger.error('Error registering user:', err.message);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login user and return JWT
router.post('/login', rateLimitMiddleware, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    logger.warn('Missing username or password in login request');
    return res.status(400).json({ message: 'Missing username or password' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      logger.warn('Invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`User ${username} logged in successfully`);
    res.json({ accessToken, refreshToken });
  } catch (err) {
    logger.error('Error logging in user:', err.message);
    res.status(500).json({ message: 'Error logging in user', error: err.message });
  }
});

module.exports = router;
