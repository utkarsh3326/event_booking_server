const mongoose = require('mongoose');
const logger = require('../utils/logger');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true }
});

// Method to update available seats
eventSchema.methods.updateSeats = async function (seats) {
  if (seats < 0 || seats > this.totalSeats) {
    logger.warn(`Invalid seat update attempt for event ${this._id}: ${seats} seats`);
    throw new Error('Invalid seat count');
  }
  this.availableSeats = seats;
  try {
    await this.save();
    logger.info(`Updated seats for event ${this._id}: ${seats}`);
  } catch (error) {
    logger.error('Error updating seats:', error.message);
    throw error;
  }
};

module.exports = mongoose.model('Event', eventSchema);
