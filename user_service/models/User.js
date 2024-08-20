const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  refreshToken: { type: String }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 8);
    next();
  } catch (error) {
    logger.error('Error hashing password:', error.message);
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.passwordHash);
  } catch (error) {
    logger.error('Error comparing password:', error.message);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);
