import express from 'express';
     import { getReviewsForRoom, createReview, updateReview, deleteReview } from '../controllers/review.controllers.js';
     import { protect } from '../middleware/auth.js';

     const router = express.Router();

     router.get('/rooms/:roomId/reviews', getReviewsForRoom);
     router.post('/rooms/:roomId/reviews', protect, createReview);
     router.put('/reviews/:reviewId', protect, updateReview);
     router.delete('/reviews/:reviewId', protect, deleteReview);

     export default router;