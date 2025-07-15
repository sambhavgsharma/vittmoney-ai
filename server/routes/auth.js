const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const router = express.Router();

// POST /api/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        // Generate a random username (e.g., user_xxxxx)
        let username;
        let isUnique = false;
        while (!isUnique) {
            username = 'user_' + Math.random().toString(36).substring(2, 8);
            const existing = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
            if (!existing) isUnique = true;
        }
        // Case-insensitive check for email only
        const existingUser = await User.findOne({
            email: { $regex: `^${email}$`, $options: 'i' }
        });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            username,
            password: hashedPassword,
            provider: 'manual'
        });
        await user.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/login
router.post('/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        // Case-insensitive check for email or username
        const user = await User.findOne({
            $or: [
                { email: { $regex: `^${emailOrUsername}$`, $options: 'i' } },
                { username: { $regex: `^${emailOrUsername}$`, $options: 'i' } }
            ]
        });
        if (!user || user.provider !== 'manual') {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        // To use secure cookies instead of body, uncomment below:
        // res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        // res.json({ user: { name: user.name, email: user.email, username: user.username, profilePic: user.profilePic, provider: user.provider } });
        res.json({ token, user: { name: user.name, email: user.email, username: user.username, profilePic: user.profilePic, provider: user.provider } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/google/callback
router.get('/google/callback', (req, res) => {
    // Placeholder for Google OAuth callback logic
    res.json({ message: 'Google callback not implemented.' });
});

// GET /api/github/callback
router.get('/github/callback', (req, res) => {
    // Placeholder for GitHub OAuth callback logic
    res.json({ message: 'GitHub callback not implemented.' });
});

// GET /api/logout
router.get('/logout', (req, res) => {
    // For JWT, logout is handled on client by deleting token
    res.json({ message: 'Logged out.' });
});

const auth = require('../middleware/auth');
// GET /api/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json({ user });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
});

module.exports = router;
