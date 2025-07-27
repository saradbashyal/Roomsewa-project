import asyncHandler from "../middleware/asyncHandler.js";
import { Service } from "../models/Service.model.js";
import { Booking } from "../models/Booking.model.js";
import { Room } from "../models/Room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  lockSlotsForService,
  releaseSlotsForService,
} from "../utils/slot.util.js";
import {
  generateEsewaSignature,
  checkEsewaTransactionStatus,
} from "../utils/esewa.util.js";
import { sendBookingConfirmationEmail } from "../utils/email.util.js";
import mongoose from "mongoose";
import axios from "axios";

const LOCK_TIMEOUT_MINUTES = 5;

// POST /api/bookings/lock-slots PRIVATE
export const lockSlots = asyncHandler(async (req, res) => {
  const { serviceId, slots, date } = req.body;
  const userId = req.user._id;

  if (!serviceId || !slots || !Array.isArray(slots) || slots.length === 0) {
    throw new ApiError(
      400,
      "Service ID and a non-empty array of slots are required."
    );
  }

  if (!date) {
    throw new ApiError(400, "Date is required for booking.");
  }

  // Transactions removed for standalone MongoDB

  try {
    const lockExpires = await lockSlotsForService(serviceId, slots, userId);
    res.status(200).json(
      new ApiResponse(
        200,
        {
          lockExpires,
          message: "Slots locked successfully",
        },
        "Slots locked for booking"
      )
    );
  } catch (error) {
    throw error;
  }
});

// POST /api/bookings PRIVATE
export const createBooking = asyncHandler(async (req, res) => {
  try {
    const {
      serviceId,
      slotIds,
      roomId,
      viewingDate,
      totalPrice,
      paymentMethod,
      bookingType,
    } = req.body;
    const userId = req.user._id;


    if (!roomId || !viewingDate || !totalPrice || !paymentMethod) {
      throw new ApiError(
        400,
        "Room ID, viewing date, total price, and payment method are required"
      );
    }

    console.log("[BOOKING] Searching for room with ID:", roomId);
    const room = await Room.findById(roomId);
    console.log("[BOOKING] Room found:", room);
    if (!room) throw new ApiError(404, "Room not found");

    // Prevent landlord from booking their own room
    if (room.landlord.toString() === userId.toString()) {
      throw new ApiError(400, "You cannot book your own room. Landlords are not allowed to book their own properties.");
    }

    // Date validations
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const viewingDateObj = new Date(viewingDate);

    // Validate viewing date is not in the past
    if (viewingDateObj < today) {
      throw new ApiError(400, "Viewing date cannot be in the past");
    }

    // Special validation for viewing bookings - restrict to 3 days maximum
    if (bookingType === "viewing") {
      const maxBookingDate = new Date(today);
      maxBookingDate.setDate(today.getDate() + 2); 

      if (viewingDateObj > maxBookingDate) {
        throw new ApiError(
          400,
          "Viewing can only be booked within the next 3 days"
        );
      }
    }

    // Validate room availability (compare only the date part)
    const availableFromDate = new Date(room.availableFrom);
    availableFromDate.setHours(0, 0, 0, 0);
    if (viewingDateObj < availableFromDate) {
      throw new ApiError(400, "Room not available for the selected viewing date");
    }

    // Prevent double booking for the same room and date (any status except Cancelled/Failed)
    const existingBooking = await Booking.findOne({
      room: roomId,
      viewingDate: viewingDateObj,
      status: { $nin: ["Cancelled", "Failed"] }
    });
    if (existingBooking) {
      throw new ApiError(400, "This room is already booked for the selected date.");
    }

    let service,
      slots = [];
    if (serviceId && slotIds) {
      service = await Service.findById(serviceId);
      if (!service) throw new ApiError(404, "Service not found");
      slots = slotIds;
      await lockSlotsForService(serviceId, slotIds, userId);
    }

    const transaction_uuid = `ROOMSEWA-${Date.now()}`;
    const product_code = process.env.ESEWA_PRODUCT_CODE;
    const signature =
      paymentMethod === "esewa"
        ? generateEsewaSignature({
            total_amount: totalPrice,
            transaction_uuid,
            product_code,
          })
        : null;

    const bookingData = {
      user: userId,
      room: roomId,
      viewingDate,
      totalPrice,
      paymentMethod,
      bookingType: bookingType || "viewing", // Default to viewing
      bookingReference: transaction_uuid,
      status: "Pending",
      paymentStatus: "Pending",
    };

    if (serviceId) {
      bookingData.service = serviceId;
      bookingData.slots = slotIds;
    }

    const booking = await Booking.create([bookingData]);

    if (paymentMethod === "esewa") {
      const paymentData = {
        amount: totalPrice,
        failure_url: `${process.env.APP_BASE_URL}/payment/failure`,
        product_delivery_charge: "0",
        product_service_charge: "0",
        product_code: process.env.ESEWA_PRODUCT_CODE,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        success_url: `${process.env.APP_BASE_URL}/payment/success`,
        tax_amount: "0",
        total_amount: totalPrice,
        transaction_uuid: transaction_uuid,
      };

      const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
      const signature = generateEsewaSignature({
        total_amount: paymentData.total_amount,
        transaction_uuid: paymentData.transaction_uuid,
        product_code: paymentData.product_code,
      });

      paymentData.signature = signature;

      try {
        // Call eSewa API to get payment URL
        const payment = await axios.post(process.env.ESEWA_FORM_URL, null, {
          params: paymentData,
        });

        if (payment.status === 200) {
          res.status(201).json(
            new ApiResponse(
              201,
              {
                booking: booking[0],
                payment_url: payment.request.res.responseUrl,
                transaction_uuid,
              },
              "Booking created, redirect to payment"
            )
          );
        } else {
          throw new ApiError(400, "Failed to initiate eSewa payment");
        }
      } catch (paymentError) {
        console.error("eSewa payment initiation failed:", paymentError);
        throw new ApiError(500, "Payment gateway error");
      }
    } else {
      res.status(201).json(
        new ApiResponse(
          201,
          {
            booking: booking[0],
            transaction_uuid,
          },
          "Booking created successfully"
        )
      );
    }
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
});

// POST /api/bookings/verify-esewa PRIVATE
export const verifyEsewaPayment = asyncHandler(async (req, res) => {
  try {
    console.log('=== VERIFY ESEWA PAYMENT ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id);
    
    const { transaction_uuid, ref_id, esewa_data } = req.body;
    const userId = req.user._id;

    if (!transaction_uuid) {
      console.log('No transaction_uuid provided');
      throw new ApiError(400, "Transaction UUID is required");
    }

    console.log('Looking for booking with reference:', transaction_uuid);
    const booking = await Booking.findOne({
      bookingReference: transaction_uuid,
    })
      .populate("room")
      .populate("user");
      
    console.log('Found booking:', booking ? {
      id: booking._id,
      user: booking.user._id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice
    } : 'NOT FOUND');
    
    if (!booking) {
      console.log('Booking not found');
      throw new ApiError(404, "Booking not found");
    }
    
    if (booking.user._id.toString() !== userId.toString()) {
      console.log('User mismatch:', { 
        bookingUser: booking.user._id.toString(), 
        requestUser: userId.toString() 
      });
      throw new ApiError(403, "Not authorized");
    }

    if (booking.status === "Confirmed") {
      console.log('Booking already confirmed');
      return res
        .status(200)
        .json(new ApiResponse(200, booking, "Booking already confirmed"));
    }

    // If we have eSewa data, verify the signature first
    if (esewa_data) {
      console.log('Verifying eSewa signature...');
      
      // Verify signature if present
      if (esewa_data.signature && esewa_data.signed_field_names) {
        const signedFields = esewa_data.signed_field_names.split(',');
        let messageData = '';
        
        signedFields.forEach((field, index) => {
          if (esewa_data[field] !== undefined) {
            messageData += index > 0 ? `,${field}=${esewa_data[field]}` : `${field}=${esewa_data[field]}`;
          }
        });
        
        const expectedSignature = generateEsewaSignature({
          total_amount: esewa_data.total_amount,
          transaction_uuid: esewa_data.transaction_uuid,
          product_code: esewa_data.product_code
        });
        
        console.log('Signature verification:', {
          received: esewa_data.signature,
          expected: expectedSignature,
          match: esewa_data.signature === expectedSignature
        });
      }
      
      // Check if payment is already complete according to eSewa
      if (esewa_data.status === 'COMPLETE') {
        console.log('eSewa reports payment as COMPLETE');
        
        // Update booking status
        booking.status = "Confirmed";
        booking.paymentStatus = "Completed";
        booking.paymentId = esewa_data.transaction_code || ref_id || transaction_uuid;
        await booking.save();

        console.log('Booking updated successfully');
        
        return res.status(200).json(
          new ApiResponse(200, booking, "Payment verified and booking confirmed")
        );
      }
    }

    console.log('Checking eSewa transaction status via API...');
    const statusCheckResult = await checkEsewaTransactionStatus(
      transaction_uuid,
      booking.totalPrice
    );
    
    console.log('eSewa status result:', statusCheckResult);
    if (statusCheckResult.status !== "COMPLETE") {
      await Booking.updateOne(
        { _id: booking._id },
        { paymentStatus: "Failed" }
      );
      if (booking.service && booking.slots) {
        await releaseSlotsForService(booking.service, booking.slots, userId);
      }
      throw new ApiError(
        400,
        `Payment verification failed: ${statusCheckResult.status}`
      );
    }

    booking.status = "Confirmed";
    booking.paymentStatus = "Completed";
    booking.paymentId = statusCheckResult.ref_id || transaction_uuid;
    await booking.save();

    await sendBookingConfirmationEmail({
      user: booking.user,
      room: await Room.findById(booking.room),
      viewingDate: booking.viewingDate,
      totalPrice: booking.totalPrice,
      bookingReference: booking.bookingReference,
      qrCode: booking.qrCode,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          booking,
          "Booking confirmed successfully via eSewa"
        )
      );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
});

// POST /api/bookings/initiate-khalti PRIVATE
export const initiateKhaltiPayment = asyncHandler(async (req, res) => {
  const {
    serviceId,
    slotIds,
    roomId,
    startDate,
    endDate,
    totalPrice,
    customerInfo,
    bookingType,
  } = req.body;
  const userId = req.user._id;

  if (!roomId || !startDate || !endDate || !totalPrice) {
    throw new ApiError(
      400,
      "Room ID, start date, end date, and total price are required"
    );
  }

  try {
    const room = await Room.findById(roomId);
    if (!room) throw new ApiError(404, "Room not found");

    // Same date validations as eSewa booking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj < today) {
      throw new ApiError(400, "Start date cannot be in the past");
    }

    if (endDateObj <= startDateObj) {
      throw new ApiError(400, "End date must be after start date");
    }

    // Special validation for viewing bookings
    if (bookingType === "viewing") {
      const maxBookingDate = new Date(today);
      maxBookingDate.setDate(today.getDate() + 2);

      if (startDateObj > maxBookingDate) {
        throw new ApiError(
          400,
          "Viewing can only be booked within the next 3 days"
        );
      }

      const expectedEndDate = new Date(startDateObj);
      expectedEndDate.setDate(startDateObj.getDate() + 1);

      if (endDateObj.getTime() !== expectedEndDate.getTime()) {
        throw new ApiError(400, "Viewing bookings must be exactly 1 day long");
      }
    }

    let service,
      slots = [];
    if (serviceId && slotIds) {
      service = await Service.findById(serviceId);
      if (!service) throw new ApiError(404, "Service not found");
      slots = slotIds;
      const slotsAlreadyLocked = slotIds.every((slotId) => {
        const slot = service.availableSlots.find(
          (s) => s._id.toString() === slotId
        );
        return (
          slot &&
          slot.status === "locked" &&
          slot.user &&
          slot.user.toString() === userId
        );
      });

      if (!slotsAlreadyLocked) {
        await lockSlotsForService(serviceId, slotIds, userId);
      }
    }

    const booking = await Booking.create([
      {
        user: userId,
        room: roomId,
        startDate,
        endDate,
        totalPrice,
        paymentMethod: "khalti",
        bookingType: bookingType || "rental",
        paymentStatus: "Pending",
        status: "Pending",
        service: serviceId,
        slots,
        customerInfo: customerInfo || {},
      },
    ]);

    const bookingId = booking[0]._id;

    const khaltiPayload = {
      return_url: `${process.env.APP_BASE_URL}/payment/success/khalti`,
      website_url: process.env.APP_BASE_URL,
      amount: totalPrice * 100,
      purchase_order_id: bookingId.toString(),
      purchase_order_name: `Room Booking - ${room.title}`,
      customer_info: {
        name: customerInfo?.name || `${req.user.firstName} ${req.user.lastName}`,
        email: customerInfo?.email || req.user.email,
        phone: customerInfo?.phone || req.user.phone,
      },
    };

    const khaltiResponse = await axios.post(
      process.env.KHALTI_BASE_URL,
      khaltiPayload,
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    booking[0].paymentId = khaltiResponse.data.pidx;
    await booking[0].save();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          payment_url: khaltiResponse.data.payment_url,
          bookingId: bookingId.toString(),
          lockExpires: slots.length
            ? service.availableSlots.find((s) => s._id.toString() === slots[0])
                .lockedUntil
            : null,
        },
        "Khalti payment initiated"
      )
    );
  } catch (error) {
    console.error(
      "Khalti Initiation Failed:",
      error.response ? error.response.data : error.message
    );
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to initiate Khalti payment"
    );
  }
});

// POST /api/bookings/verify-khalti PRIVATE
export const verifyKhaltiPayment = asyncHandler(async (req, res) => {
  const { pidx, purchase_order_id } = req.body;
  const userId = req.user._id;

  if (!pidx || !purchase_order_id) {
    throw new ApiError(400, "PIDX and purchase order ID are required");
  }

  const booking = await Booking.findById(purchase_order_id)
    .populate("room");
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.user.toString() !== userId.toString())
    throw new ApiError(403, "Not authorized");

  if (booking.status === "Confirmed") {
    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking already confirmed"));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const lookupResponse = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    const { status, total_amount, transaction_id } = lookupResponse.data;
    const isVerified =
      status === "Completed" && total_amount === booking.totalPrice * 100;

    if (!isVerified) {
      booking.paymentStatus =
        status === "User canceled" ? "Cancelled" : "Failed";
      await booking.save({ session });
      if (booking.service && booking.slots) {
        await releaseSlotsForService(
          booking.service,
          booking.slots,
          userId,
          session
        );
      }
      await session.commitTransaction();
      throw new ApiError(400, "Payment verification failed or was cancelled");
    }

    booking.paymentStatus = "Completed";
    booking.status = "Confirmed";
    booking.paymentId = transaction_id;
    await booking.save({ session });

    await sendBookingConfirmationEmail({
      user: booking.user,
      room: await Room.findById(booking.room),
      viewingDate: booking.viewingDate,
      totalPrice: booking.totalPrice,
      bookingReference: booking.bookingReference,
      qrCode: booking.qrCode,
    });

    await session.commitTransaction();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          booking,
          "Booking confirmed successfully via Khalti"
        )
      );
  } catch (error) {
    await session.abortTransaction();
    console.error("Khalti Verification Failed:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to verify Khalti payment"
    );
  } finally {
    session.endSession();
  }
});

// GET /api/bookings/user/:userId PRIVATE
export const getBookings = asyncHandler(async (req, res) => {
  console.log('=== GET BOOKINGS DEBUG ===');
  console.log('Request params:', req.params);
  console.log('Request user:', req.user ? { id: req.user._id, role: req.user.role } : 'NO USER');
  
  const { userId } = req.params;
  
  if (req.user._id.toString() !== userId && req.user.role !== "admin") {
    console.log('Authorization failed:', {
      requestUserId: req.user._id.toString(),
      paramUserId: userId,
      userRole: req.user.role
    });
    throw new ApiError(403, "Not authorized to view these bookings");
  }

  console.log('Searching for bookings with user ID:', userId);
  
  const bookings = await Booking.find({ user: userId })
    .populate({
      path: "room",
      select: "title location roomType price posterImage images",
      populate: {
        path: "landlord",
        select: "name username email phone"
      }
    })
    .sort({ createdAt: -1 });

  console.log('Found bookings:', bookings.length);
  console.log('Bookings data:', bookings.map(b => ({
    id: b._id,
    user: b.user,
    room: b.room?.title,
    status: b.status,
    createdAt: b.createdAt
  })));

  res
    .status(200)
    .json(new ApiResponse(200, { bookings }, "Bookings retrieved successfully"));
});

// GET /api/bookings PRIVATE[Admin]
export const getAllBookings = asyncHandler(async (req, res) => {
  try {
    console.log('getAllBookings called with query:', req.query);
    const { page = 1, limit = 10, status, serviceId, userId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (serviceId) query.service = serviceId;
    if (userId) query.user = userId;

    console.log('Database query:', query);

    const bookings = await Booking.find(query)
      .populate("user", "firstName lastName username email phone")
      .populate("room", "title location")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('Bookings found:', bookings.length);

    const total = await Booking.countDocuments(query);
    console.log('Total bookings:', total);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          bookings,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        "All bookings fetched successfully"
      )
    );
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    throw error;
  }
});

// GET /api/bookings/:id PRIVATE
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("room", "title location")
    .populate({
      path: "service",
      populate: [
        { path: "provider", select: "name email phone" },
        { path: "category", select: "name description" },
      ],
    });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (
    booking.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Not authorized to view this booking");
  }

  res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking fetched successfully"));
});

// PUT /api/bookings/:id/cancel PRIVATE
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to cancel this booking");
  }

  if (booking.status === "Cancelled") {
    throw new ApiError(400, "Booking is already cancelled");
  }

  if (booking.status === "CheckedIn" || booking.status === "CheckedOut") {
    throw new ApiError(
      400,
      "Cannot cancel a checked-in or checked-out booking"
    );
  }

  try {
    booking.status = "Cancelled";
    booking.paymentStatus = "Cancelled";
    await booking.save();

    res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
  } catch (error) {
    console.error('Cancel booking error:', error);
    throw new ApiError(500, `Failed to cancel booking: ${error.message}`);
  }
});

// POST /api/bookings/:id/resend-email PRIVATE
export const resendBookingEmail = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("room")
    .populate({
      path: "service",
      populate: [{ path: "provider" }, { path: "category" }],
    });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to access this booking");
  }

  await sendBookingConfirmationEmail({
    user: booking.user,
    room: booking.room,
    viewingDate: booking.viewingDate,
    totalPrice: booking.totalPrice,
    bookingReference: booking.bookingReference,
    qrCode: booking.qrCode,
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Confirmation email resent successfully"));
});

// GET /api/bookings/:id/receipt PRIVATE
export const getBookingReceipt = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("room", "title")
    .populate({
      path: "service",
      populate: [
        { path: "provider", select: "name" },
        { path: "category", select: "name" },
      ],
    });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to access this booking");
  }

  const receiptHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Receipt - ${booking.bookingReference}</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f9; display: flex; justify-content: center; align-items: center; }
              .receipt { background-color: white; border: 1px solid #ddd; padding: 25px; width: 400px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
              .header { text-align: center; border-bottom: 2px solid #6d28d9; padding-bottom: 15px; margin-bottom: 20px; }
              .header h1 { margin: 0; color: #6d28d9; font-size: 28px; }
              .header p { margin: 5px 0 0; font-size: 14px; color: #555; }
              .room-title { font-size: 22px; font-weight: bold; margin-bottom: 5px; color: #111; }
              .property-name { font-size: 14px; color: #555; margin-bottom: 20px; }
              .details-grid { display: grid; grid-template-columns: 120px 1fr; gap: 10px; font-size: 14px; margin-bottom: 20px; }
              .details-grid strong { color: #333; }
              .booking-id { margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; }
              .booking-id strong { font-size: 16px; color: #6d28d9; letter-spacing: 1px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
              .amount { font-size: 18px; font-weight: bold; color: #6d28d9; text-align: center; margin: 15px 0; }
          </style>
      </head>
      <body>
          <div class="receipt">
              <div class="header">
                  <h1>RoomSewa Receipt</h1>
                  <p>Room Booking Confirmation</p>
              </div>
              <h2 class="room-title">${booking.room.title}</h2>
              <p class="property-name">at ${booking.room.location.address}, ${booking.room.location.city}</p>
              <div class="details-grid">
                  <strong>Start Date:</strong>
                  <span>${new Date(booking.startDate).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}</span>
                  <strong>End Date:</strong>
                  <span>${new Date(booking.endDate).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}</span>
                  <strong>Status:</strong>
                  <span>${booking.status}</span>
                  <strong>Payment:</strong>
                  <span>${booking.paymentMethod.toUpperCase()} - ${
    booking.paymentStatus
  }</span>
                  ${
                    booking.service
                      ? `<strong>Service:</strong><span>${booking.service.name}</span>`
                      : ""
                  }
                  ${
                    booking.slots && booking.slots.length
                      ? `<strong>Slots:</strong><span>${booking.slots.length} slot(s) booked</span>`
                      : ""
                  }
              </div>
              <div class="amount">
                  Total: NPR ${booking.totalPrice.toFixed(2)}
              </div>
              <div class="booking-id">
                  <p style="margin:0; font-size: 12px; color: #555;">Booking Reference</p>
                  <strong>${booking.bookingReference}</strong>
              </div>
              <div class="footer">
                  Thank you for booking with RoomSewa!
              </div>
          </div>
      </body>
      </html>
    `;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        htmlContent: receiptHtml,
        filename: `RoomSewa_Receipt_${booking.bookingReference}.html`,
      },
      "Receipt generated successfully"
    )
  );
});

// GET /api/bookings/stats PRIVATE[Admin]
export const getBookingStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchQuery = {};
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const stats = await Booking.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ["$status", "Confirmed"] }, 1, 0] },
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
        },
        averageBookingValue: { $avg: "$totalPrice" },
      },
    },
  ]);

  const statusBreakdown = await Booking.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: stats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          averageBookingValue: 0,
        },
        statusBreakdown,
      },
      "Booking statistics retrieved successfully"
    )
  );
});
