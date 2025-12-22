const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// Serve uploaded profile pictures statically
app.use('/uploads/profile-pics', express.static(path.join(__dirname, 'uploads', 'profile-pics')));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vittmoney';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'VittMoney API is running' });
});

// Google Auth
const passport = require('passport');
require('./auth/google');
require('./auth/github'); // <-- Add this line
app.use(passport.initialize());

// Dashboard route
const authMiddleware = require('./middleware/auth');
app.get('/api/dashboard', authMiddleware, (req, res) => {
    // Assuming req.user is set by authMiddleware
    res.json({ user: req.user });
});

// OAuth routes
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// Expense routes
const expenseRoutes = require('./routes/expenses');
app.use('/api/expenses', expenseRoutes);

// Analytics routes
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});