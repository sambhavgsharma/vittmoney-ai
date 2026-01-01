const express = require('express');
const router = express.Router();
const { sendContactFormEmail, sendContactConfirmationEmail } = require('../utils/email');

/**
 * POST /api/contact
 * Handle contact form submissions from the landing page
 * 
 * Request body:
 * {
 *   name: string (required),
 *   email: string (required, valid email),
 *   message: string (required, min 10 chars)
 * }
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Validate message length
    if (message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters long' });
    }

    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email service not configured');
      return res.status(500).json({ 
        error: 'Email service is not configured. Please contact support.' 
      });
    }

    // Send email to admin
    await sendContactFormEmail({ name, email, message });

    // Send confirmation email to user
    await sendContactConfirmationEmail(email, name);

    res.status(200).json({ 
      success: true,
      message: 'Thank you for your message! We will get back to you soon.' 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    
    // Don't expose sensitive error details to client
    if (error.message.includes('Email configuration missing')) {
      return res.status(500).json({ 
        error: 'Email service is not properly configured. Please try again later.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to send message. Please try again later.' 
    });
  }
});

module.exports = router;
