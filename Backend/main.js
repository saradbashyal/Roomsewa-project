import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import roomRouter from './Router/room.router.js';
import bookingRouter from './Router/booking.router.js';
import notificationRouter from './Router/notification.router.js';
import reviewRouter from './Router/review.router.js';
import recommendationRouter from './Router/recommendation.router.js';
import adminRouter from './Router/admin.router.js';
import contactRouter from './Router/contact.router.js';
import { ApiError } from './utils/ApiError.js';
import authRoute from './Router/auth.route.js'
dotenv.config();
const app = express();

import cookieParser from 'cookie-parser';
app.use(cookieParser());
// Parse JSON bodies with increased limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware
app.use(cors({
  origin: [
    'https://roomsewa-frontend.vercel.app',
    'https://roomsewa-admin.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3001'
  ],
  credentials: true
}));

// Routes
app.use('/api/users', authRoute);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/admin', adminRouter);
app.use('/api/contact', contactRouter);

app.get('/', (req, res) => {
    res.send('Welcome to Roomsewa backend');
});

// Global error handler
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ message: err.message, errors: err.errors });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    }
    console.error('Server Error:', err.stack);
    res.status(500).json({ message: 'Internal Server Error', details: err.message });
});

export default app;