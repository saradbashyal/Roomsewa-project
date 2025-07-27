import asyncHandler from "../middleware/asyncHandler.js";
import { Room } from "../models/Room.model.js";
import { User } from "../models/User.model.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Get all rooms with optional filtering and pagination
export const getRooms = asyncHandler(async (req, res) => {
    const { city, roomType, page = 1, limit = 10 } = req.query;
    const query = {};
    if (city) query['location.city'] = { $regex: city, $options: 'i' }; // Case-insensitive search
    if (roomType) query.roomType = roomType;

    const [rooms, total] = await Promise.all([
        Room.find(query)
            .populate('landlord', 'name email')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 }),
        Room.countDocuments(query)
    ]);

    res.status(200).json(new ApiResponse(200, { rooms, total, page: Number(page), limit: Number(limit) }, "Rooms fetched successfully."));
});

// Get a single room by ID
export const getRoomById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
        throw new Error("Invalid room ID");
    }

    const room = await Room.findById(id).populate('landlord', 'name email');
    
    if (!room) {
        throw new Error("Room not found");
    }

    res.status(200).json(new ApiResponse(200, room, "Room fetched successfully."));
});

// Create a new room
export const createRoom = asyncHandler(async (req, res) => {
    const landlord = req.user._id;
    const { title, description, price, location, roomType, amenities, availableFrom, posterImage } = req.body;

    // Basic validation
    if (!mongoose.isValidObjectId(landlord)) {
        throw new Error("Invalid landlord ID");
    }
    if (!title || typeof title !== 'string' || title.length > 100) {
        throw new Error("Title is required and must be a string under 100 characters");
    }
    if (!description || typeof description !== 'string') {
        throw new Error("Description is required and must be a string");
    }
    if (typeof price !== 'number' || price < 0) {
        throw new Error("Price must be a non-negative number");
    }
    if (!location || !location.city || !location.address) {
        throw new Error("City and address are required");
    }
    const validRoomTypes = ['single', 'shared', 'hostel', '1bhk', '2bhk', '3bhk'];
    if (!roomType || !validRoomTypes.includes(roomType)) {
        throw new Error("Invalid room type");
    }
    const validAmenities = ['wifi', 'parking', 'kitchen', 'bathroom', 'balcony', 'air_conditioning', 'heating', 'tv', 'laundry', 'furnished'];
    if (!amenities || !Array.isArray(amenities) || amenities.length === 0 || !amenities.every(a => validAmenities.includes(a))) {
        throw new Error("At least one valid amenity is required");
    }
    if (!availableFrom || isNaN(new Date(availableFrom).getTime())) {
        throw new Error("Invalid availableFrom date");
    }
    if (!posterImage || !posterImage.url || typeof posterImage.url !== 'string') {
        throw new Error("Poster image URL is required");
    }

    // Check if landlord exists
    const user = await User.findById(landlord);
    if (!user) throw new Error("Landlord not found");

    // Whitelist fields
    const roomData = {
        landlord,
        title,
        description,
        price,
        location,
        roomType,
        amenities,
        availableFrom,
        posterImage,
        titleNepali: typeof req.body.titleNepali === 'string' ? req.body.titleNepali : undefined,
        descriptionNepali: typeof req.body.descriptionNepali === 'string' ? req.body.descriptionNepali : undefined,
        availableUntil: req.body.availableUntil ? new Date(req.body.availableUntil) : undefined,
        bannerImage: req.body.bannerImage,
        featured: typeof req.body.featured === 'boolean' ? req.body.featured : undefined
    };

    try {
        const room = await Room.create(roomData);
        console.log('[ROOM CREATE] Room created:', room);
        res.status(201).json(new ApiResponse(201, room, "Room created successfully."));
    } catch (error) {
        console.error('[ROOM CREATE] Error creating room:', error);
        throw error;
    }
});

// Update a room
export const updateRoom = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new Error("Invalid room ID");
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
        throw new Error("Room not found");
    }

    // Authorization
    if (req.user._id.toString() !== room.landlord.toString()) {
        throw new Error("Unauthorized to update this room");
    }

    // Whitelist and validate updates
    const allowedUpdates = [
        'title', 'titleNepali', 'description', 'descriptionNepali', 'price',
        'location', 'roomType', 'amenities', 'availableFrom', 'availableUntil',
        'posterImage', 'bannerImage', 'featured'
    ];
    const validRoomTypes = ['single', 'shared', 'hostel', '1bhk', '2bhk', '3bhk'];
    const validAmenities = ['wifi', 'parking', 'kitchen', 'bathroom', 'balcony', 'air_conditioning', 'heating', 'tv', 'laundry', 'furnished'];
    const updateData = {};
    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
            if (key === 'title' && (!req.body.title || typeof req.body.title !== 'string' || req.body.title.length > 100)) {
                throw new Error("Title must be a string under 100 characters");
            }
            if (key === 'description' && (!req.body.description || typeof req.body.description !== 'string')) {
                throw new Error("Description must be a string");
            }
            if (key === 'price' && (typeof req.body.price !== 'number' || req.body.price < 0)) {
                throw new Error("Price must be a non-negative number");
            }
            if (key === 'location' && req.body.location) {
                if (!req.body.location.city || !req.body.location.address) {
                    throw new Error("City and address are required");
                }
                updateData.location = req.body.location;
            }
            if (key === 'roomType' && (!req.body.roomType || !validRoomTypes.includes(req.body.roomType))) {
                throw new Error("Invalid room type");
            }
            if (key === 'amenities' && (!req.body.amenities || !Array.isArray(req.body.amenities) || req.body.amenities.length === 0 || !req.body.amenities.every(a => validAmenities.includes(a)))) {
                throw new Error("At least one valid amenity is required");
            }
            if (key === 'availableFrom' && (!req.body.availableFrom || isNaN(new Date(req.body.availableFrom).getTime()))) {
                throw new Error("Invalid availableFrom date");
            }
            if (key === 'availableUntil' && req.body.availableUntil && isNaN(new Date(req.body.availableUntil).getTime())) {
                throw new Error("Invalid availableUntil date");
            }
            if (key === 'posterImage' && (!req.body.posterImage || !req.body.posterImage.url || typeof req.body.posterImage.url !== 'string')) {
                throw new Error("Poster image URL is required");
            }
            if (key === 'featured' && typeof req.body.featured !== 'boolean') {
                throw new Error("Featured must be a boolean");
            }
            updateData[key] = req.body[key];
        }
    });

    const updatedRoom = await Room.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('landlord', 'name email');

    if (!updatedRoom) {
        throw new Error("Room not found");
    }

    res.status(200).json(new ApiResponse(200, updatedRoom, "Room updated successfully."));
});

// Delete a room
export const deleteRoom = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new Error("Invalid room ID");
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
        throw new Error("Room not found");
    }

    // Authorization
    if (req.user._id.toString() !== room.landlord.toString()) {
        throw new Error("Unauthorized to delete this room");
    }

    await room.deleteOne();
    res.status(200).json(new ApiResponse(200, null, "Room deleted successfully."));
});

// Get rooms by landlord - GET /api/rooms/landlord/:landlordId
export const getRoomsByLandlord = asyncHandler(async (req, res) => {
    const { landlordId } = req.params;
    
    // Authorization check
    if (req.user._id.toString() !== landlordId && req.user.role !== "admin") {
        throw new Error("Not authorized to view these listings");
    }

    if (!mongoose.isValidObjectId(landlordId)) {
        throw new Error("Invalid landlord ID");
    }

    const rooms = await Room.find({ landlord: landlordId })
        .populate('landlord', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, { rooms }, "Landlord's rooms fetched successfully."));
});