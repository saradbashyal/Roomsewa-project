import asyncHandler from "../middleware/asyncHandler.js";
import { Notification } from "../models/Notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//GET /api/notifications PRIVATE
export const getNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const unreadOnly = req.query.unread === 'true';

    const query = {
        user: req.user.id,
        isActive: true,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ]
    }

    if (type) query.type = type;
    if (unreadOnly) query.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
        Notification.find(query)
            .populate('relatedData.propertyId', 'title location rent images status')
            .populate('relatedData.bookingId', 'propertyId checkInDate checkOutDate status')
            .populate('relatedData.userId', 'fullName email phone profileImage')
            .populate('relatedData.reviewId', 'rating comment propertyId')
            .sort({ priority: -1, createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean(),
        Notification.countDocuments({
            user: req.user.id,
            isRead: false,
            isActive: true
        })
    ])

    const localizedNotifications = notifications.map(notification => ({
        ...notification,
        title: req.language === 'ne' && notification.titleNepali ?
            notification.titleNepali : notification.title,
        message: req.language === 'ne' && notification.messageNepali ?
            notification.messageNepali : notification.message,
        actionText: req.language === 'ne' && notification.actionTextNepali ?
            notification.actionTextNepali : notification.actionText
    }));

    return res.status(200).json(
        new ApiResponse(200, {
            notifications: localizedNotifications,
            unreadCount,
            hasMore: notifications.length === limit
        }, "Notifications retrieved successfully")
    )
})

//PATCH /api/notifications/read PRIVATE
export const markAsRead = asyncHandler(async (req, res) => {
    const { notificationIds, markAll } = req.body;
    let updateQuery = { user: req.user.id }

    if (markAll) {
        updateQuery.isRead = false;
    } else if (notificationIds && Array.isArray(notificationIds)) {
        updateQuery._id = { $in: notificationIds }
    } else {
        throw new ApiError(400, "Either provide notificationIds array or set markAll to true")
    }

    const result = await Notification.updateMany(
        updateQuery,
        { isRead: true, readAt: new Date() }
    )

    return res.status(200).json(new ApiResponse(
        200,
        { modifiedCount: result.modifiedCount },
        "Notifications marked as read"
    ))
})

//POST /api/notifications PRIVATE[admin]
export const createNotification = asyncHandler(async (req, res) => {
    const { 
        userIds,
        title,
        titleNepali,
        message,
        messageNepali,
        type,
        priority = 'normal',
        icon,
        actionUrl,
        actionText,
        actionTextNepali,
        relatedData = {},
        expiresAt,
        metadata = {}
    } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new ApiError(400, "userIds array is required")
    }

    const notifications = userIds.map(userId => ({
        user: userId,
        title,
        titleNepali,
        message,
        messageNepali,
        type,
        priority,
        icon,
        actionUrl,
        actionText,
        actionTextNepali,
        relatedData,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        metadata
    }))

    const created = await Notification.insertMany(notifications)

    return res.status(201).json(new ApiResponse(201, { created: created.length }, "Notifications created successfully"))
})

//DELETE /api/notifications/:id PRIVATE
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
    })

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Notification deleted successfully")
    );
})

//GET /api/notifications/stats PRIVATE
export const getNotificationStats = asyncHandler(async (req, res) => {
    const stats = await Notification.aggregate([
        { 
            $match: { 
                user: req.user.id,
                isActive: true 
            } 
        },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                unreadCount: {
                    $sum: {
                        $cond: [{ $eq: ['$isRead', false] }, 1, 0]
                    }
                }
            }
        }
    ]);

    const totalUnread = await Notification.countDocuments({
        user: req.user.id,
        isRead: false,
        isActive: true
    });

    return res.status(200).json(
        new ApiResponse(200, {
            statsByType: stats,
            totalUnread
        }, "Notification statistics retrieved successfully")
    );
})

//PATCH /api/notifications/settings PRIVATE
export const updateNotificationSettings = asyncHandler(async (req, res) => {
    const { 
        emailNotifications = true,
        pushNotifications = true,
        bookingUpdates = true,
        propertyInquiries = true,
        paymentReminders = true,
        systemAlerts = true,
        marketingEmails = false,
        maintenanceAlerts = true
    } = req.body;

    const settings = {
        emailNotifications,
        pushNotifications,
        bookingUpdates,
        propertyInquiries,
        paymentReminders,
        systemAlerts,
        marketingEmails,
        maintenanceAlerts
    };

    // Update user notification preferences in database
    // This would require a UserSettings model or adding settings to User model
    
    return res.status(200).json(
        new ApiResponse(200, settings, "Notification settings updated successfully")
    );
})

// Helper function to create notifications for room rental events
export const createNotificationForUser = async (userId, notificationData) => {
    try {
        const notification = new Notification({
            user: userId,
            ...notificationData
        })

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

// Helper function for bulk notifications (e.g., system announcements)
export const createBulkNotifications = async (userIds, notificationData) => {
    try {
        const notifications = userIds.map(userId => ({
            user: userId,
            ...notificationData
        }));

        return await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
        throw error;
    }
}

// Helper function for property-related notifications
export const createPropertyNotification = async (propertyId, userIds, notificationData) => {
    try {
        const notifications = userIds.map(userId => ({
            user: userId,
            type: 'property_update',
            relatedData: {
                propertyId,
                ...notificationData.relatedData
            },
            ...notificationData
        }));

        return await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating property notifications:', error);
        throw error;
    }
}

// Helper function for booking notifications
export const createBookingNotification = async (bookingId, userIds, notificationData) => {
    try {
        const notifications = userIds.map(userId => ({
            user: userId,
            type: 'booking_update',
            relatedData: {
                bookingId,
                ...notificationData.relatedData
            },
            ...notificationData
        }));

        return await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating booking notifications:', error);
        throw error;
    }
}

// Helper function for payment notifications
export const createPaymentNotification = async (userId, paymentData, notificationData) => {
    try {
        const notification = new Notification({
            user: userId,
            type: 'payment',
            priority: 'high',
            relatedData: {
                paymentId: paymentData.paymentId,
                amount: paymentData.amount,
                propertyId: paymentData.propertyId,
                ...notificationData.relatedData
            },
            ...notificationData
        });

        return await notification.save();
    } catch (error) {
        console.error('Error creating payment notification:', error);
        throw error;
    }
}

// Helper function for inquiry notifications (for property owners)
export const createInquiryNotification = async (ownerId, inquiryData, notificationData) => {
    try {
        const notification = new Notification({
            user: ownerId,
            type: 'inquiry',
            priority: 'normal',
            relatedData: {
                inquiryId: inquiryData.inquiryId,
                propertyId: inquiryData.propertyId,
                inquirerUserId: inquiryData.inquirerUserId,
                ...notificationData.relatedData
            },
            ...notificationData
        });

        return await notification.save();
    } catch (error) {
        console.error('Error creating inquiry notification:', error);
        throw error;
    }
}

// Helper function for review notifications
export const createReviewNotification = async (userId, reviewData, notificationData) => {
    try {
        const notification = new Notification({
            user: userId,
            type: 'review',
            relatedData: {
                reviewId: reviewData.reviewId,
                propertyId: reviewData.propertyId,
                reviewerUserId: reviewData.reviewerUserId,
                rating: reviewData.rating,
                ...notificationData.relatedData
            },
            ...notificationData
        });

        return await notification.save();
    } catch (error) {
        console.error('Error creating review notification:', error);
        throw error;
    }
}

// Helper function for maintenance notifications
export const createMaintenanceNotification = async (tenantIds, maintenanceData, notificationData) => {
    try {
        const notifications = tenantIds.map(tenantId => ({
            user: tenantId,
            type: 'maintenance',
            priority: 'high',
            relatedData: {
                maintenanceId: maintenanceData.maintenanceId,
                propertyId: maintenanceData.propertyId,
                scheduledDate: maintenanceData.scheduledDate,
                ...notificationData.relatedData
            },
            ...notificationData
        }));

        return await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating maintenance notifications:', error);
        throw error;
    }
}