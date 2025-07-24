import express from 'express';
     import { 
         getDashboardStats, 
         getAllUsers, 
         getAllRooms, 
         getRevenueReport, 
         getComprehensiveAnalytics,
         approveRoom,
         rejectRoom,
         deleteRoom
     } from '../controllers/admin.controllers.js';
     import { getAllBookings } from '../controllers/booking.controllers.js';
     import { protect, authorize } from '../middleware/auth.js';

     const router = express.Router();

     router.get('/stats', protect, authorize('admin'), getDashboardStats);
     router.get('/users', protect, authorize('admin'), getAllUsers);
     router.get('/rooms', protect, authorize('admin'), getAllRooms);
     router.patch('/rooms/:id/approve', protect, authorize('admin'), approveRoom);
     router.patch('/rooms/:id/reject', protect, authorize('admin'), rejectRoom);
     router.delete('/rooms/:id', protect, authorize('admin'), deleteRoom);
     router.get('/bookings', protect, authorize('admin'), getAllBookings);
     router.get('/revenue-report', protect, authorize('admin'), getRevenueReport);
     router.get('/analytics/comprehensive', protect, authorize('admin'), getComprehensiveAnalytics);

     export default router;