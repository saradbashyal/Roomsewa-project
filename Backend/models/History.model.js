import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: false
    },
    actionType: {
        type: String,
        enum: ["viewed", "booked"],
        required: true
    },
    actionAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const History = mongoose.model("History", historySchema);