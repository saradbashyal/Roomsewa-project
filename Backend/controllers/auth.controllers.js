import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/User.model.js";
import crypto from 'crypto'
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendPasswordResetEmail, sendPasswordResetOTP, sendWelcomeEmail } from "../utils/email.util.js";

//   POST /api/auth/register PUBLIC
export const register = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, phone, address, role } = req.body;

    const userExists = await User.findOne({ email })
    if (userExists) {
        throw new ApiError(409, 'A user with this email already exists.');
    }

    let avatarData = {
        url: '/uploads/default-avatar.png',
        public_id: null
    };

    const avatarFile = req.file;
    if (avatarFile) {
        const avatarUpload = await uploadOnCloudinary(avatarFile.buffer, avatarFile.mimetype, "avatars");
        if (!avatarUpload) throw new ApiError(500, 'Error uploading avatar.');

        avatarData = {
            url: avatarUpload.secure_url,
            public_id: avatarUpload.public_id
        };
    }

    const username = `${firstName}_${lastName}`.trim();

    const user = await User.create({ 
        firstName,
        lastName,
        username,
        email,
        password,
        phone,
        address,
        role,
        avatar: avatarData
    })
    console.log("user",user);
    // Send welcome email
    try {
        await sendWelcomeEmail({
            email: user.email,
            username: user.username,
            firstName: firstName
        });
    } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Don't throw error for email failure during registration
    }

    sendTokenResponse(user, 201, res);
})

//   POST /api/auth/login PUBLIC
export const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email and password'
            })
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new ApiError(401, "Invalid credentials")
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            throw new ApiError(401, 'Invalid credentials')
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('🔴 Login Error:', err.stack);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
})

//   GET /api/auth/logout PRIVATE
export const logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        data: {}
    })
})

//  GET /api/auth/me PRIVATE
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('wishlist', 'title images pricePerNight location');

    res.status(200).json({
        success: true,
        data: user
    })
})

//  PATCH /api/auth/updatedetails PRIVATE
export const updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        'profile.firstName': req.body.firstName,
        'profile.lastName': req.body.lastName,
        'profile.bio': req.body.bio,
        'profile.dateOfBirth': req.body.dateOfBirth,
        'profile.gender': req.body.gender,
        'profile.occupation': req.body.occupation
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
        if (fieldsToUpdate[key] === undefined) {
            delete fieldsToUpdate[key];
        }
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: user
    });
})

// PATCH /api/auth/updateavatar PRIVATE
export const updateAvatar = asyncHandler(async (req, res) => {
    const avatarFile = req.file;
    if (!avatarFile) {
        throw new ApiError(400, 'No file uploaded.')
    }

    const avatarUpload = await uploadOnCloudinary(avatarFile.buffer, avatarFile.mimetype, "avatars");
    if (!avatarUpload) {
        throw new ApiError(500, 'Error uploading avatar.')
    }

    const oldAvatarPublicId = req.user.avatar?.public_id;
    if (oldAvatarPublicId) {
        await deleteFromCloudinary(oldAvatarPublicId);
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        {
            avatar: {
                url: avatarUpload.secure_url,
                public_id: avatarUpload.public_id
            }
        },
        { new: true, runValidators: true }
    );

    res.status(200).json(new ApiResponse(200, user, 'Avatar updated successfully.'));
})

// PATCH /api/auth/preferences PRIVATE
export const updatePreferences = asyncHandler(async (req, res) => {
    const { priceRange, roomType, amenities, location } = req.body;

    const updateData = {};
    if (priceRange) updateData['profile.preferences.priceRange'] = priceRange;
    if (roomType) updateData['profile.preferences.roomType'] = roomType;
    if (amenities) updateData['profile.preferences.amenities'] = amenities;
    if (location) updateData['profile.preferences.location'] = location;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json(new ApiResponse(200, user, 'Preferences updated successfully.'));
})

// POST /api/auth/wishlist/:roomId PRIVATE
export const addToWishlist = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.wishlist.includes(roomId)) {
        throw new ApiError(400, 'Room already in wishlist');
    }

    user.wishlist.push(roomId);
    await user.save();

    res.status(200).json(new ApiResponse(200, user, 'Room added to wishlist.'));
})

// DELETE /api/auth/wishlist/:roomId PRIVATE
export const removeFromWishlist = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== roomId);
    await user.save();

    res.status(200).json(new ApiResponse(200, user, 'Room removed from wishlist.'));
})

//   PATCH /api/auth/updatepassword PRIVATE
export const updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
        return res.status(401).json({
            success: false,
            error: 'Current password is incorrect'
        });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

//  POST /api/auth/forgotpassword PUBLIC
export const forgotPassword = asyncHandler(async (req, res, next) => {
    console.log('🔵 Forgot password request received for email:', req.body.email);
    
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        console.log('🔴 User not found for email:', req.body.email);
        return res.status(200).json(new ApiResponse(200, {}, 'If a user with that email exists, an OTP has been sent.'));
    }

    console.log('✅ User found:', user.email);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔢 Generated OTP:', otp);

    // Hash and store OTP
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });
    console.log('💾 OTP saved to database');

    try {
        console.log('📧 Attempting to send email to:', user.email);
        await sendPasswordResetOTP({
            email: user.email,
            username: user.username,
            otp: otp,
        })
        console.log('✅ Email sent successfully');

        res.status(200).json(new ApiResponse(200, {}, 'OTP sent to your email successfully.'));
    } catch (error) {
        console.error('🔴 Email sending failed:', error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, 'Email could not be sent');
    }
})

// POST /api/auth/verify-otp PUBLIC
export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, 'Email, OTP, and new password are required');
    }

    // Hash the provided OTP
    const hashedOTP = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    const user = await User.findOne({
        email,
        resetPasswordToken: hashedOTP,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, 'Invalid or expired OTP');
    }

    // Update password and clear OTP fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json(new ApiResponse(200, null, 'Password reset successfully'));
});

//  PUT /api/auth/resetpassword/:resettoken PUBLIC
export const resetPassword = asyncHandler(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(400, 'Invalid or expired token')
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
})

// GET /api/auth/booking-history PRIVATE
export const getBookingHistory = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ user: req.user.id })
        .populate({
            path: 'room',
            populate: {
                path: 'property',
                select: 'name location'
            }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalBookings = await Booking.countDocuments({ user: req.user.id });

    res.status(200).json(new ApiResponse(200, {
        bookings,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalBookings / limit),
            totalBookings,
            hasNext: page < Math.ceil(totalBookings / limit),
            hasPrev: page > 1
        }
    }, 'Booking history retrieved successfully.'));
})

// helper function 
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();


    // Use JWT_TOKEN_EXPIRE from .env, which is in the format '7d' or '1d'
    let days = 7; // default
    if (process.env.JWT_TOKEN_EXPIRE) {
        const match = process.env.JWT_TOKEN_EXPIRE.match(/(\d+)/);
        if (match) days = parseInt(match[1], 10);
    }
    const options = {
        expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    user.password = undefined;
    res.status(statusCode).cookie('token', token, options).json({ 
        success: true, 
        token, 
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar
    })
}