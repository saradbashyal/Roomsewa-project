import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    price: { type: Number, default: 0 },
    status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lockedUntil: { type: Date, default: null }
});

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    availableSlots: [slotSchema],
    basePrice: { type: Number, required: true },
    hasLockedSlots: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

serviceSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const Service = mongoose.model('Service', serviceSchema);