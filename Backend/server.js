import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './main.js'; // Import the app from main.js
import cookieParser from 'cookie-parser';

dotenv.config();

app.use(cookieParser());

// Connect to MongoDB
const dbUrl = process.env.MONGODB_URL;
mongoose.connect(dbUrl, {
    retryWrites: true,
    w: 'majority'
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit on connection failure
    });

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing server...');
    await mongoose.connection.close();
    process.exit(0);
});