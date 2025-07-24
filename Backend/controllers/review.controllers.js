import asyncHandler from "../middleware/asyncHandler.js";
import { Room } from "../models/Room.model.js";
import { Review } from "../models/Review.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /api/rooms/:roomId/reviews PUBLIC
export const getReviewsForRoom = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ room: req.params.roomId })
        .populate('user', 'username avatar')
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully."));
});

// POST /api/rooms/:roomId/reviews PRIVATE
export const createReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const roomId = req.params.roomId;
    const userId = req.user.id;

    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found.");
    }

    const existingReview = await Review.findOne({ room: roomId, user: userId });
    if (existingReview) {
        throw new ApiError(400, "You have already submitted a review for this room.");
    }

    const review = await Review.create({
        room: roomId,
        user: userId,
        rating,
        comment,
    });

    return res.status(201).json(new ApiResponse(201, review, "Review submitted successfully."));
});

// PUT /api/reviews/:reviewId PRIVATE
export const updateReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    let review = await Review.findById(req.params.reviewId);

    if (!review) {
        throw new ApiError(404, "Review not found.");
    }

    if (review.user.toString() !== req.user.id) {
        throw new ApiError(401, "Not authorized to update this review.");
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();

    return res.status(200).json(new ApiResponse(200, review, "Review updated successfully."));
});

// DELETE /api/reviews/:reviewId PRIVATE
export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
        throw new ApiError(404, "Review not found.");
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError(401, "Not authorized to delete this review.");
    }

    await review.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Review deleted successfully."));
});