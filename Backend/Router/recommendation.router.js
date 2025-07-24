import express from 'express';
     import { getRecommendations, getUserPreferences } from '../controllers/recommendation.controllers.js';
     import { protect } from '../middleware/auth.js';

     const router = express.Router();

     router.get('/', protect, getRecommendations);
     router.get('/preferences', protect, getUserPreferences);

     export default router;