const nodemailer = require('nodemailer');

/**
 * Email service for sending emails via Nodemailer
 * Uses SMTP configuration from environment variables
 */

// Create reusable transporter (using Gmail SMTP or any provider)
const createTransporter = () => {
  // For Gmail with App Passwords:
  // 1. Enable 2FA on your Google account
  // 2. Generate an App Password at myaccount.google.com/apppasswords
  // 3. Use that password in EMAIL_PASSWORD
  
  // For other providers, update the service and auth details accordingly
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @returns {Promise} Nodemailer send result
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    console.log(`📨 Sending email to ${to}...`);
    
    // Add timeout to email sending
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email send timeout (>5s)')), 5000)
    );
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log('✅ Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
};

/**
 * Send contact form submission to admin email
 * @param {Object} contactData - Object with name, email, message
 * @returns {Promise} Email send result
 */
const sendContactFormEmail = async (contactData) => {
  const { name, email, message } = contactData;
  const adminEmail = process.env.ACCT_EMAIL_ID || 'info2itachi@gmail.com';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #66FF99 0%, #04443C 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
      </div>
      <div style="background: #f8f8f8; padding: 30px; border-radius: 0 0 10px 10px;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background: white; padding: 15px; border-left: 4px solid #66FF99; border-radius: 4px; word-wrap: break-word;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated message from VittMoney AI contact form.
        </p>
      </div>
    </div>
  `;

  return sendEmail(adminEmail, `New Contact Form Submission from ${name}`, htmlContent);
};

/**
 * Send confirmation email to the user
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @returns {Promise} Email send result
 */
const sendContactConfirmationEmail = async (userEmail, userName) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #66FF99 0%, #04443C 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Thank You for Reaching Out!</h1>
      </div>
      <div style="background: #f8f8f8; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Thank you for contacting VittMoney AI. We've received your message and will get back to you as soon as possible.</p>
        <p style="margin-top: 30px; color: #666;">
          In the meantime, feel free to explore our platform and start tracking your finances smarter.
        </p>
        <p style="margin-top: 30px; color: #666; font-size: 12px; text-align: center;">
          Best regards,<br/>
          The VittMoney AI Team
        </p>
      </div>
    </div>
  `;

  return sendEmail(userEmail, 'We Received Your Message - VittMoney AI', htmlContent);
};

module.exports = {
  sendEmail,
  sendContactFormEmail,
  sendContactConfirmationEmail,
};
