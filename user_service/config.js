module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: "mongodb+srv://event_booking:EventBooking%402024@cluster0.4m0yk.mongodb.net/userdb?retryWrites=true&w=majority&appName=Cluster0",
  REDIS_URL: process.env.REDIS_URL, 
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE || '15m',
  REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE || '7d',
};
