import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please specify the user']
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Please specify the room']
    },
    viewingDate: {
        type: Date,
        required: [true, 'Please specify the viewing date']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Please add total price']
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Cancelled'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['esewa', 'khalti', 'card', 'cash', 'bank_transfer'],
        required: [true, 'Please add payment method']
    },
    paymentId: {
        type: String
    },
    bookingReference: {
        type: String,
        unique: true
    },
    qrCode: {
        type: String
    },
    bookingType: {
        type: String,
        enum: ['viewing', 'rental'],
        default: 'rental'
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'CheckedIn', 'CheckedOut'],
        default: 'Pending'
    }
}, { timestamps: true });

// Generate booking reference and QR code before saving
bookingSchema.pre('save', function (next) {
    if (!this.bookingReference) {
        // Generate unique reference code: RS-timestamp-random
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.bookingReference = `RS-${timestamp}${random}`;

        // Generate QR code URL (using a public service for demo)
        const qrData = `${this.bookingReference}-${this._id}`;
        this.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    }
    next();
});

// Add compound indexes for querying
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ room: 1 });
bookingSchema.index({ property: 1 });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);