const express = require("express");
const User = require("../Models/User.js");
const authMiddleware = require("../middleware/auth.js");
const { sendEmail } = require("../utils/email.js");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, "../uploads/profile-pics");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * PUT /api/users/profile
 * Update user profile (name and/or profile picture)
 * Requires authentication
 */
router.put("/profile", authMiddleware, upload.single("profilePic"), async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name && !req.file) {
      return res
        .status(400)
        .json({ message: "At least name or profile picture must be provided." });
    }

    if (name && name.trim().length === 0) {
      return res.status(400).json({ message: "Name cannot be empty." });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      // Clean up uploaded file if user doesn't exist
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      return res.status(404).json({ message: "User not found." });
    }

    // Update name if provided
    if (name) {
      user.name = name.trim();
    }

    // Update profile picture if provided
    if (req.file) {
      // Delete old profile picture if it exists and is not the default
      if (
        user.profilePic &&
        user.profilePic !== "/assets/images/logo.svg" &&
        !user.profilePic.startsWith("http")
      ) {
        const oldFilePath = path.join(__dirname, "..", "uploads", user.profilePic.replace(/^\/uploads\//, ""));
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("Error deleting old profile picture:", err);
        });
      }

      // Set new profile picture URL
      user.profilePic = `/uploads/profile-pics/${req.file.filename}`;
    }

    // Save user
    await user.save();

    res.json({
      message: "Profile updated successfully.",
      user: {
        name: user.name,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic,
        provider: user.provider,
      },
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/users/request-delete-account
 * Request account deletion and send verification email
 * Requires authentication
 */
router.post("/request-delete-account", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify email matches
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ message: "Email does not match." });
    }

    // Generate verification token (6-digit code)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes

    // Store verification code in user document (temporarily)
    user.deleteAccountToken = verificationCode;
    user.deleteAccountTokenExpiry = new Date(expiryTime);
    await user.save();

    // Send verification email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF6B6B 0%, #8B3A3A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Account Deletion Request</h1>
        </div>
        <div style="background: #f8f8f8; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #333; font-size: 16px;">Hello ${user.name},</p>
          
          <p style="color: #666; margin: 20px 0;">We received a request to delete your VittMoney AI account. This action cannot be undone.</p>
          
          <div style="background: #FFE5E5; border-left: 4px solid #FF6B6B; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #8B3A3A; margin: 0; font-weight: bold;">Warning: Permanent Deletion</p>
            <p style="color: #8B3A3A; margin: 5px 0 0 0;">All your data including expenses, settings, and profile information will be permanently removed.</p>
          </div>
          
          <p style="color: #666; margin: 20px 0;">Use the following verification code to confirm deletion:</p>
          
          <div style="background: white; border: 2px solid #FF6B6B; padding: 20px; text-align: center; margin: 20px 0; border-radius: 4px;">
            <p style="font-size: 12px; color: #999; margin-top: 0;">VERIFICATION CODE</p>
            <p style="font-size: 32px; font-weight: bold; color: #FF6B6B; margin: 10px 0; letter-spacing: 5px;">${verificationCode}</p>
            <p style="font-size: 12px; color: #999; margin-bottom: 0;">Valid for 10 minutes</p>
          </div>
          
          <p style="color: #666; margin: 20px 0;">If you did not request this, please ignore this email. Your account will remain active.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from VittMoney AI. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    await sendEmail(
      email,
      "Account Deletion Request - Verification Code",
      htmlContent
    );

    res.json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    console.error("Error requesting account deletion:", err);
    res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/users/confirm-delete-account
 * Confirm account deletion with verification code
 * Requires authentication
 */
router.post("/confirm-delete-account", authMiddleware, async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({ message: "Email and verification code are required." });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify email matches
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ message: "Email does not match." });
    }

    // Check if verification code exists and is still valid
    if (
      !user.deleteAccountToken ||
      user.deleteAccountToken !== verificationCode
    ) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (!user.deleteAccountTokenExpiry || user.deleteAccountTokenExpiry < new Date()) {
      return res.status(400).json({ message: "Verification code has expired." });
    }

    // Delete user's data
    // Note: Consider implementing soft delete or archival instead of hard delete
    // For now, we'll hard delete

    // Delete profile picture if it exists
    if (
      user.profilePic &&
      user.profilePic !== "/assets/images/logo.svg" &&
      !user.profilePic.startsWith("http")
    ) {
      const filePath = path.join(__dirname, "..", "uploads", user.profilePic.replace(/^\/uploads\//, ""));
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting profile picture:", err);
      });
    }

    // Delete user document
    await User.findByIdAndDelete(userId);

    // Optional: Delete user's expenses and other related data
    // const Expense = require('../Models/Expense.js');
    // await Expense.deleteMany({ userId });

    res.json({
      message: "Account deleted successfully.",
    });
  } catch (err) {
    console.error("Error confirming account deletion:", err);
    res.status(500).json({ message: "Server error." });
  }
});

/**
 * PUT /api/users/currency
 * Update user's preferred currency
 * Requires authentication
 */
router.put("/currency", authMiddleware, async (req, res) => {
  try {
    const { currency } = req.body;
    const userId = req.user.id;

    // Validate input
    const validCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY'];
    if (!currency || !validCurrencies.includes(currency)) {
      return res.status(400).json({ 
        message: `Invalid currency. Allowed values: ${validCurrencies.join(', ')}` 
      });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { preferredCurrency: currency },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: "Currency preference updated successfully.",
      preferredCurrency: user.preferredCurrency
    });
  } catch (err) {
    console.error("Error updating currency:", err);
    res.status(500).json({ message: "Server error." });
  }
});

/**
 * GET /api/users/me
 * Get current user profile including currency preference
 * Requires authentication
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      provider: user.provider,
      preferredCurrency: user.preferredCurrency || 'INR'
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
