import asyncHandler from "../middleware/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendContactEmail } from "../utils/email.util.js";

// POST /api/contact PUBLIC
export const submitContactForm = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, subject, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address"
        });
    }

    try {
        // Send contact email to admin
        await sendContactEmail({
            firstName,
            lastName,
            email,
            subject,
            message
        });

        res.status(200).json(
            new ApiResponse(200, {}, "Your message has been sent successfully! We'll get back to you within 24 hours.")
        );
    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to send message. Please try again later."
        });
    }
});
