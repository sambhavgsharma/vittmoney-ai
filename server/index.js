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

// Health check endpoint (for Docker/Kubernetes health checks)
app.get('/health', (req, res) => {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
        res.status(200).json({ status: 'healthy', db: 'connected' });
    } else {
        res.status(503).json({ status: 'unhealthy', db: 'disconnected' });
    }
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

// Contact form routes
const contactRoutes = require('./routes/contact');
app.use('/api', contactRoutes);

// AI routes
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// Users routes (profile, account deletion, etc)
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});