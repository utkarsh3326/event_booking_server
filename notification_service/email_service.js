// emailService.js
const nodemailer = require('nodemailer');
const { EMAIL_SERVICE_API_KEY, EMAIL_FROM } = require('./config');
const logger = require('./utils/logger');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Change to your email provider
  auth: {
    user: EMAIL_FROM,
    pass: EMAIL_SERVICE_API_KEY,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
    });
    logger.info(`Email sent to ${to} with subject ${subject}`);
  } catch (err) {
    logger.error('Error sending email:', err.message);
    throw err;
  }
};

module.exports = sendEmail;
