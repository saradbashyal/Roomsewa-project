import express from 'express';
import { getNotifications, markAsRead, createNotification, deleteNotification, getNotificationStats, updateNotificationSettings } from '../controllers/notification.controllers.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.patch('/read', authMiddleware, markAsRead);
router.post('/', authMiddleware, createNotification);
router.delete('/:id', authMiddleware, deleteNotification);
router.get('/stats', authMiddleware, getNotificationStats);
router.patch('/settings', authMiddleware, updateNotificationSettings);

export default router;