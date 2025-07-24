import express from 'express';
import { createBooking, getBookings, verifyEsewaPayment, cancelBooking } from '../controllers/booking.controllers.js';
import { protect as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create a booking
router.post('/', authMiddleware, createBooking);

// Verify eSewa payment
router.post('/verify-esewa', authMiddleware, verifyEsewaPayment);

// Cancel a booking
router.put('/:id/cancel', authMiddleware, cancelBooking);

// Get user's bookings
router.get('/user/:userId', authMiddleware, getBookings);

export default router;
