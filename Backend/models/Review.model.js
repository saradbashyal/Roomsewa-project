import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide a rating between 1 and 5'],
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot be more than 500 characters'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
}, { timestamps: true });

// Only allow one review per user per room
reviewSchema.index({ room: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (roomId) {
    const stats = await this.aggregate([
        {
            $match: { room: roomId }
        },
        {
            $group: {
                _id: '$room',
                numRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        if (stats.length > 0) {
            await this.model('Room').findByIdAndUpdate(roomId, {
                userScore: {
                    average: stats[0].avgRating,
                    count: stats[0].numRatings
                }
            });
        } else {
            await this.model('Room').findByIdAndUpdate(roomId, {
                userScore: {
                    average: 0,
                    count: 0
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
};

reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.room);
});

reviewSchema.post('delete', function () {
    this.constructor.calculateAverageRating(this.room);
});

export const Review = mongoose.model('Review', reviewSchema);