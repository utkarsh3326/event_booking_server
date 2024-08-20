
module.exports = {
    PORT: process.env.PORT || 5001,
    MONGO_URI: "mongodb+srv://event_booking:EventBooking%402024@cluster0.4m0yk.mongodb.net/eventdb?retryWrites=true&w=majority&appName=Cluster0",
    REDIS_URL: process.env.REDIS_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
};