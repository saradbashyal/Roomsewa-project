import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please add a landlord'],
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    titleNepali: {
        type: String,
        trim: true,
        maxlength: [100, 'Nepali title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    descriptionNepali: {
        type: String
    },
    price: {
        type: Number,
        required: [true, 'Please add a rental price'],
        min: [0, 'Price cannot be negative']
    },
    location: {
        city: {
            type: String,
            required: [true, 'Please add a city']
        },
        address: {
            type: String,
            required: [true, 'Please add an address'],
            trim: true
        },
        coordinates: {
            latitude: { 
                type: Number,
                min: [-90, 'Latitude must be between -90 and 90'],
                max: [90, 'Latitude must be between -90 and 90']
            },
            longitude: { 
                type: Number,
                min: [-180, 'Longitude must be between -180 and 180'],
                max: [180, 'Longitude must be between -180 and 180']
            }
        }
    },
    roomType: {
        type: String,
        enum: ['single', 'shared', 'hostel', '1bhk', '2bhk', '3bhk'],
        required: [true, 'Please specify the room type']
    },
    amenities: {
        type: [String],
        required: [true, 'Please add at least one amenity'],
        validate: {
            validator: function(arr) {
                return arr.length > 0;
            },
            message: 'At least one amenity is required'
        },
        enum: [
            'wifi', 'parking', 'kitchen', 'bathroom', 'balcony',
            'air_conditioning', 'heating', 'tv', 'laundry', 'furnished'
        ]
    },
    availableFrom: {
        type: Date,
        required: [true, 'Please add availability start date']
    },
    availableUntil: {
        type: Date
    },
    posterImage: {
        url: {
            type: String,
            required: [true, 'Please add poster image URL']
        },
        public_id: { type: String }
    },
    bannerImage: {
        url: { type: String },
        public_id: { type: String }
    },
    bookingCount: {
        type: Number,
        default: 0,
        min: 0
    },
    userScore: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    statistics: {
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalRevenue: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

// Indexes for efficient querying
roomSchema.index({ landlord: 1, createdAt: -1 });
roomSchema.index({ 'location.city': 1, price: 1 });
roomSchema.index({ featured: 1, availableFrom: -1 });
roomSchema.index({ roomType: 1, 'location.city': 1 });
roomSchema.index({ 'statistics.averageRating': -1 });

roomSchema.methods.incrementBookingCount = function (amount = 1, revenue = 0) {
    this.bookingCount += amount;
    this.statistics.totalRevenue += revenue;
    return this.save();
};

export const Room = mongoose.model('Room', roomSchema);