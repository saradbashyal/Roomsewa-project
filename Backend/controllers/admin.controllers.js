import asyncHandler from "../middleware/asyncHandler.js";
import { Booking } from "../models/Booking.model.js";
import { Room } from "../models/Room.model.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//   GET /api/admin/stats PRIVATE[Admin]
export const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalRooms = await Room.countDocuments();

    const bookingStats = await Booking.aggregate([
        {
            $match: { paymentStatus: 'Completed' }
        },
        {
            $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: '$totalPrice' }
            }
        }
    ])

    const occupancyStats = await Booking.aggregate([
        {
            $match: { 
                paymentStatus: 'Completed',
                viewingDate: { $lte: new Date() },
                status: 'Confirmed'
            }
        },
        {
            $group: {
                _id: null,
                currentOccupancy: { $sum: 1 }
            }
        }
    ])

    // Get recent activity - last 10 bookings
    const recentBookings = await Booking.find()
        .populate('user', 'firstName lastName email')
        .populate('room', 'title')
        .sort({ createdAt: -1 })
        .limit(10);

    const stats = {
        totalUsers,
        totalRooms,
        totalBookings: bookingStats[0]?.totalBookings || 0,
        totalRevenue: bookingStats[0]?.totalRevenue || 0,
        currentOccupancy: occupancyStats[0]?.currentOccupancy || 0,
        occupancyRate: totalRooms > 0 ? ((occupancyStats[0]?.currentOccupancy || 0) / totalRooms * 100).toFixed(2) : 0,
        recentActivity: recentBookings
    }

    return res.status(200).json(new ApiResponse(200, stats, "Dashboard stats fetched successfully."))
})

// GET /api/admin/users PRIVATE[Admin]
export const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    
    if (role) {
        query.role = role;
    }
    
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } }
        ];
    }
    
    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json(new ApiResponse(200, {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
    }, "Users retrieved successfully"));
});

// GET /api/admin/rooms PRIVATE[Admin]
export const getAllRooms = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    if (status) {
        query.status = status;
    }
    
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'location.city': { $regex: search, $options: 'i' } },
            { 'location.address': { $regex: search, $options: 'i' } }
        ];
    }
    
    const rooms = await Room.find(query)
        .populate('landlord', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    
    const total = await Room.countDocuments(query);
    
    res.status(200).json(new ApiResponse(200, {
        rooms,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
    }, "Rooms retrieved successfully"));
});

//GET /api/admin/revenue-report?days=30
export const getRevenueReport = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const revenueData = await Booking.aggregate([
        { $match: { paymentStatus: "Completed", createdAt: { $gte: startDate, $lte: endDate } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalRevenue: { $sum: "$totalPrice" },
                totalBookings: { $sum: 1 }
            },
        },
        { $sort: { _id: 1 } }
    ])

    const topRooms = await Booking.aggregate([
        { $match: { paymentStatus: 'Completed', createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$room', totalRevenue: { $sum: "$totalPrice" }, bookingCount: { $sum: 1 } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'roomDetails' } },
        { $unwind: "$roomDetails" },
        { $project: { 
            _id: 0, 
            roomTitle: "$roomDetails.title", 
            totalRevenue: 1,
            bookingCount: 1
        } }
    ])

    const report = {
        periodDays: days,
        dailyRevenue: revenueData,
        topRooms
    }

    res.status(200).json(new ApiResponse(200, report, `Revenue report for the last ${days} days.`))
})

let analyticsCache = {
    data: null,
    timestamp: null
}
const CACHE_DURATION_MS = 60 * 60 * 1000;

//GET  /api/admin/analytics/comprehensive?startDate=...&endDate=... PRIVATE[Admin]
export const getComprehensiveAnalytics = asyncHandler(async (req, res) => {
    if (analyticsCache.data && (Date.now() - analyticsCache.timestamp < CACHE_DURATION_MS)) {
        return res.status(200).json(new ApiResponse(200, analyticsCache.data, "Comprehensive analytics fetched from cache."))
    }
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
        dateFilter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }

    const [revenueAnalytics, userEngagement, roomPerformance, propertyUtilization] = await Promise.all([
        getRevenueAnalytics(dateFilter), 
        getUserEngagementMetrics(dateFilter), 
        getRoomPerformanceStats(dateFilter), 
        getPropertyUtilizationStats(dateFilter)
    ])

    const analytics = {
        revenue: revenueAnalytics,
        userEngagement,
        roomPerformance,
        propertyUtilization,
        generatedAt: new Date()
    }

    analyticsCache = { data: analytics, timestamp: Date.now() }

    return res.status(200).json(new ApiResponse(200, analytics, "Comprehensive analytics fetched successfully."))
})

//   PATCH /api/admin/rooms/:id/approve PRIVATE[Admin]
export const approveRoom = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
        return res.status(404).json(new ApiResponse(404, null, "Room not found"));
    }

    room.status = 'approved';
    await room.save();

    return res.status(200).json(new ApiResponse(200, room, "Room approved successfully"));
})

//   PATCH /api/admin/rooms/:id/reject PRIVATE[Admin]
export const rejectRoom = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
        return res.status(404).json(new ApiResponse(404, null, "Room not found"));
    }

    room.status = 'rejected';
    await room.save();

    return res.status(200).json(new ApiResponse(200, room, "Room rejected successfully"));
})

//   DELETE /api/admin/rooms/:id PRIVATE[Admin]
export const deleteRoom = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const room = await Room.findByIdAndDelete(id);
    if (!room) {
        return res.status(404).json(new ApiResponse(404, null, "Room not found"));
    }

    return res.status(200).json(new ApiResponse(200, null, "Room deleted successfully"));
})

//helper function for revenue analytics
const getRevenueAnalytics = async (dateFilter) => {
    const revenueData = await Booking.aggregate([
        { $match: { paymentStatus: 'Completed', ...dateFilter } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                dailyRevenue: { $sum: '$totalAmount' },
                dailyBookings: { $sum: 1 },
                avgBookingValue: { $avg: '$totalAmount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ])

    const paymentMethodBreakdown = await Booking.aggregate([
        { $match: { paymentStatus: 'Completed', ...dateFilter } },
        {
            $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 },
                revenue: { $sum: '$totalAmount' }
            }
        }
    ])

    const bookingDurationStats = await Booking.aggregate([
        { $match: { paymentStatus: 'Completed', ...dateFilter } },
        {
            $addFields: {
                stayDuration: {
                    $divide: [
                        { $subtract: ['$checkOutDate', '$checkInDate'] },
                        1000 * 60 * 60 * 24
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                avgStayDuration: { $avg: '$stayDuration' },
                maxStayDuration: { $max: '$stayDuration' },
                minStayDuration: { $min: '$stayDuration' }
            }
        }
    ])

    return {
        dailyRevenue: revenueData,
        paymentMethods: paymentMethodBreakdown,
        stayDurationStats: bookingDurationStats[0] || {},
        totalRevenue: revenueData.reduce((sum, day) => sum + day.dailyRevenue, 0),
        totalBookings: revenueData.reduce((sum, day) => sum + day.dailyBookings, 0),
        avgBookingValue: revenueData.length > 0 ? revenueData.reduce((sum, day) => sum + day.avgBookingValue, 0) / revenueData.length : 0
    }
}

//helper function for user engagement metrics
const getUserEngagementMetrics = async (dateFilter) => {
    const newUsers = await User.countDocuments(dateFilter);
    const activeUsers = await Booking.distinct('user', {
        paymentStatus: 'Completed',
        ...dateFilter
    })

    const userActivity = await User.aggregate([
        { $lookup: { from: 'bookings', localField: '_id', foreignField: 'user', as: 'bookings' } },
        {
            $project: {
                username: 1,
                email: 1,
                createdAt: 1,
                bookingCount: { $size: '$bookings' },
                totalSpent: {
                    $sum: {
                        $map: {
                            input: '$bookings',
                            as: 'booking',
                            in: {
                                $cond: [
                                    { $eq: ['$$booking.paymentStatus', 'Completed'] },
                                    '$$booking.totalAmount', 0
                                ]
                            }
                        }
                    }
                }
            }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
    ])

    const repeatCustomers = await User.aggregate([
        { $lookup: { from: 'bookings', localField: '_id', foreignField: 'user', as: 'bookings' } },
        {
            $match: {
                $expr: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: '$bookings',
                                    cond: { $eq: ['$$this.paymentStatus', 'Completed'] }
                                }
                            }
                        },
                        1
                    ]
                }
            }
        },
        { $count: 'count' }
    ])

    return {
        newUsers,
        activeUsers: activeUsers.length,
        topSpenders: userActivity,
        repeatCustomers: repeatCustomers[0]?.count || 0,
        retentionRate: activeUsers.length > 0 ? (activeUsers.length / newUsers) * 100 : 0
    }
}

//Helper function for room performance stats
const getRoomPerformanceStats = async (dateFilter) => {
    const topRooms = await Booking.aggregate([
        { $match: { paymentStatus: 'Completed', ...dateFilter } },
        {
            $lookup: { from: 'rooms', localField: 'room', foreignField: '_id', as: 'roomData' }
        },
        { $unwind: '$roomData' },
        {
            $lookup: { from: 'properties', localField: 'roomData.property', foreignField: '_id', as: 'propertyData' }
        },
        { $unwind: '$propertyData' },
        {
            $group: {
                _id: '$room',
                roomTitle: { $first: '$roomData.title' },
                propertyName: { $first: '$propertyData.name' },
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                averageRating: { $first: '$roomData.averageRating' },
                roomType: { $first: '$roomData.roomType' }
            }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
    ])

    const roomTypePerformance = await Room.aggregate([
        {
            $group: {
                _id: '$roomType',
                roomCount: { $sum: 1 },
                averagePrice: { $avg: '$pricePerNight' },
                averageRating: { $avg: '$averageRating' }
            }
        },
        { $sort: { roomCount: -1 } }
    ])

    const occupancyRates = await Room.aggregate([
        {
            $lookup: {
                from: 'bookings',
                localField: '_id',
                foreignField: 'room',
                as: 'bookings'
            }
        },
        {
            $addFields: {
                completedBookings: {
                    $filter: {
                        input: '$bookings',
                        cond: { $eq: ['$$this.paymentStatus', 'Completed'] }
                    }
                }
            }
        },
        {
            $project: {
                title: 1,
                roomType: 1,
                totalBookings: { $size: '$completedBookings' },
                occupancyRate: {
                    $multiply: [
                        { $divide: [{ $size: '$completedBookings' }, 30] }, // Assuming 30 days period
                        100
                    ]
                }
            }
        },
        { $sort: { occupancyRate: -1 } }
    ])

    return {
        topPerformingRooms: topRooms,
        roomTypePerformance,
        occupancyRates,
        totalRoomsAvailable: await Room.countDocuments({ isActive: true })
    }
}

//helper function for property utilization stats
const getPropertyUtilizationStats = async (dateFilter) => {
    const propertyStats = await Booking.aggregate([
        { $match: { paymentStatus: 'Completed', ...dateFilter } },
        {
            $lookup: {
                from: 'rooms',
                localField: 'room',
                foreignField: '_id',
                as: 'roomData'
            }
        },
        { $unwind: '$roomData' },
        {
            $lookup: { from: 'properties', localField: 'roomData.property', foreignField: '_id', as: 'propertyData' }
        },
        { $unwind: '$propertyData' },
        {
            $group: {
                _id: '$roomData.property',
                propertyName: { $first: '$propertyData.name' },
                location: { $first: '$propertyData.location' },
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                uniqueRooms: { $addToSet: '$room' }
            }
        }, 
        {
            $project: {
                propertyName: 1,
                location: 1,
                totalBookings: 1,
                totalRevenue: 1,
                uniqueRoomsBooked: { $size: '$uniqueRooms' }
            }
        },
        { $sort: { totalRevenue: -1 } }
    ])

    const propertyOccupancy = await Property.aggregate([
        {
            $lookup: {
                from: 'rooms',
                localField: '_id',
                foreignField: 'property',
                as: 'rooms'
            }
        },
        {
            $lookup: {
                from: 'bookings',
                let: { propertyId: '$_id' },
                pipeline: [
                    {
                        $lookup: {
                            from: 'rooms',
                            localField: 'room',
                            foreignField: '_id',
                            as: 'roomInfo'
                        }
                    },
                    { $unwind: '$roomInfo' },
                    {
                        $match: {
                            $expr: { $eq: ['$roomInfo.property', '$$propertyId'] },
                            paymentStatus: 'Completed'
                        }
                    }
                ],
                as: 'bookings'
            }
        },
        {
            $project: {
                name: 1,
                location: 1,
                totalRooms: { $size: '$rooms' },
                totalBookings: { $size: '$bookings' },
                occupancyRate: {
                    $cond: [
                        { $gt: [{ $size: '$rooms' }, 0] },
                        {
                            $multiply: [
                                { $divide: [{ $size: '$bookings' }, { $size: '$rooms' }] },
                                100
                            ]
                        },
                        0
                    ]
                }
            }
        },
        { $sort: { occupancyRate: -1 } }
    ])

    return {
        propertyPerformance: propertyStats,
        propertyOccupancy,
        totalProperties: await Property.countDocuments()
    }
}