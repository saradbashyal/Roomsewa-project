import express from 'express';
import { createRoom, getRooms, getRoomById, updateRoom, deleteRoom, getRoomsByLandlord } from '../controllers/room.controllers.js';
import { protect as authMiddleware } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(getRooms));
router.get('/landlord/:landlordId', authMiddleware, asyncHandler(getRoomsByLandlord));
router.get('/:id', asyncHandler(getRoomById));
router.post('/', authMiddleware, asyncHandler(createRoom));
router.put('/:id', authMiddleware, asyncHandler(updateRoom));
router.delete('/:id', authMiddleware, asyncHandler(deleteRoom));

export default router;