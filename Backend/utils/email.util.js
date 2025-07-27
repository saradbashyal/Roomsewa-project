import nodemailer from "nodemailer";
import transporter from '../config/nodemailer.config.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { User } from '../models/User.model.js';

export const sendWelcomeEmail = asyncHandler(async (options) => {
    try {
        // display user ko nam
        const displayName = options.userName || `${options.firstName || ''} ${options.lastName || ''}`.trim() || 'User';
        const mailOptions = {
            from: `"RoomSewa" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: 'Welcome to RoomSewa!',
            html: `
                <h2>Welcome, ${displayName}!</h2>
                <p>Thank you for registering with RoomSewa. We are excited to have you on board.</p>
                <p>Start exploring and find your perfect room today!</p>
                <p>Best regards,<br/>The RoomSewa Team</p>
            `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${options.email}. MessageId: %s`, info.messageId);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
});


export const sendBookingConfirmationEmail = asyncHandler(async (bookingDetails) => {
    try {
        const user = await User.findById(bookingDetails.user);
        if (!user) {
            console.error('User not found for booking confirmation email:', bookingDetails.user);
            return;
        }

        const roomTitle = bookingDetails.room.title;
        const propertyName = bookingDetails.property.name;
        const bookingViewingDate = new Date(bookingDetails.viewingDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const mailOptions = {
            from: `"RoomSewa" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Your RoomSewa Booking Confirmation: ${roomTitle}`,
            text: `Dear ${user.userName || 'User'}, \n\nYour booking for ${roomTitle} at ${propertyName} for viewing on ${bookingViewingDate} is confirmed!\n\nTotal Price: NPR ${bookingDetails.totalPrice}\nBooking Reference: ${bookingDetails.bookingReference}\n\nThank you for using RoomSewa!`,
            html: `
            <p>Dear ${user.userName || 'User'},</p>
            <p>Your booking for <strong>${roomTitle}</strong> at <strong>${propertyName}</strong> is confirmed!</p>
            <ul>
                <li><strong>Viewing Date:</strong> ${bookingViewingDate}</li>
                <li><strong>Total Price:</strong> NPR ${bookingDetails.totalPrice}</li>
                <li><strong>Booking Reference:</strong> ${bookingDetails.bookingReference}</li>
                <li><strong>QR Code:</strong> <img src="${bookingDetails.qrCode}" alt="Booking QR code"/></li>
            </ul>
            <p>Thank you for using RoomSewa!</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
    }
});

export const sendPasswordResetEmail = asyncHandler(async (options) => {
    const mailOptions = {
        from: `"RoomSewa" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: 'RoomSewa Password Reset Request',
        html: `
            <p>Hi ${options.userName},</p>
            <p>You requested a password reset. Please click the link below to create a new password. This link is valid for 10 minutes.</p>
            <a href="${options.resetUrl}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,<br/>The RoomSewa Team</p>
        `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${options.email}`);
});

// Send OTP for password reset
export const sendPasswordResetOTP = asyncHandler(async (options) => {
    const mailOptions = {
        from: `"RoomSewa" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: 'RoomSewa Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #0891b2; margin: 0;">RoomSewa</h1>
                        <p style="color: #666; margin: 5px 0;">Password Reset Request</p>
                    </div>
                    
                    <p style="color: #333; font-size: 16px;">Hi ${options.username},</p>
                    
                    <p style="color: #666; line-height: 1.6;">
                        You requested a password reset for your RoomSewa account. 
                        Please use the following 6-digit verification code:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #0891b2; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 10px; letter-spacing: 8px; display: inline-block;">
                            ${options.otp}
                        </div>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        This code is valid for <strong>10 minutes</strong>. 
                        If you did not request this password reset, please ignore this email.
                    </p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                        <p style="color: #999; font-size: 14px;">
                            Thanks,<br/>
                            The RoomSewa Team
                        </p>
                    </div>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP sent to ${options.email}: ${options.otp}`);
});

export const sendRoomAvailableEmail = asyncHandler(async (options) => {
    try {
        const mailOptions = {
            from: `"RoomSewa" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: `Room Available: ${options.roomTitle}!`,
            html: `<p>Hi ${options.userName},</p>
            <p>Good news! A room from your wishlist, <strong>${options.roomTitle}</strong>, is now available.</p>
            <a href="${options.roomLink}">Click here to view details and book!</a>
            <p>Thanks,<br/>The RoomSewa Team</p>`
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Room available email sent: %s`, info.messageId);
    } catch (error) {
        console.error('Error sending room available email:', error);
    }
});

export const sendContactInquiryEmail = asyncHandler(async (options) => {
    try {
        const mailOptions = {
            from: `"RoomSewa Notifier" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_ADMIN,
            replyTo: options.email,
            subject: `New Contact Form Submission from ${options.fullName}`,
            html: `
                <h2>New Inquiry from RoomSewa Contact Form</h2>
                <p><strong>Name:</strong> ${options.fullName}</p>
                <p><strong>Email:</strong> ${options.email}</p>
                <hr>
                <h3>Message:</h3>
                <p style="white-space: pre-wrap;">${options.message}</p>
            `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Contact inquiry from ${options.email} sent to admin. MessageId: %s`, info.messageId);
    } catch (error) {
        console.error('Error sending contact inquiry email:', error);
    }
});

export const sendContactEmail = asyncHandler(async (options) => {
    try {
        const mailOptions = {
            from: `"RoomSewa Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Send to admin email
            replyTo: options.email,
            subject: `Contact Form: ${options.subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">
                        New Contact Form Submission
                    </h2>
                    
                    <div style="background-color: #f0fdff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Contact Details:</h3>
                        <p><strong>Name:</strong> ${options.firstName} ${options.lastName}</p>
                        <p><strong>Email:</strong> <a href="mailto:${options.email}">${options.email}</a></p>
                        <p><strong>Subject:</strong> ${options.subject}</p>
                    </div>
                    
                    <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h3 style="margin-top: 0; color: #374151;">Message:</h3>
                        <p style="white-space: pre-wrap; line-height: 1.6; color: #4b5563;">${options.message}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #92400e;">
                            <strong>Note:</strong> You can reply directly to this email to respond to ${options.firstName}.
                        </p>
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 12px; color: #6b7280; text-align: center;">
                        This email was sent from the RoomSewa contact form.
                    </p>
                </div>
            `,
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`Contact form email sent to admin. MessageId: %s`, info.messageId);
    } catch (error) {
        console.error('Error sending contact form email:', error);
        throw error;
    }
});