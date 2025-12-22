const express = require("express");
const router = express.Router();
const Expense = require("../Models/Expense");
const authMiddleware = require("../middleware/auth");
const mongoose = require("mongoose");

/**
 * GET /api/analytics/summary
 * Returns: total spent, expense count, average per day
 * Query: month (YYYY-MM format)
 */
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const { month } = req.query; // Expected format: "2025-12"

    if (!month) {
      return res.status(400).json({ message: "Month parameter required (YYYY-MM)" });
    }

    // Parse month to get start and end dates
    const [year, monthNum] = month.split("-");
    const start = new Date(`${year}-${monthNum}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const result = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const data = result[0] || { totalSpent: 0, count: 0 };
    
    // Calculate average per day
    const daysInMonth = end.getDate() === 1 ? 
      new Date(end.getFullYear(), end.getMonth(), 0).getDate() : 
      end.getDate() - 1;
    
    const avgPerDay = data.count > 0 ? data.totalSpent / daysInMonth : 0;

    res.json({
      ...data,
      avgPerDay: Math.round(avgPerDay * 100) / 100,
      month,
    });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
});

/**
 * GET /api/analytics/category-breakdown
 * Returns: spending by category as pie chart data
 */
router.get("/category-breakdown", authMiddleware, async (req, res) => {
  try {
    const { month } = req.query;

    // Build match stage based on month filter
    const matchStage = {
      userId: new mongoose.Types.ObjectId(req.user.id),
    };

    if (month) {
      const [year, monthNum] = month.split("-");
      const start = new Date(`${year}-${monthNum}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      matchStage.date = { $gte: start, $lt: end };
    }

    const data = await Expense.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: { $ifNull: ["$category", "Uncategorized"] },
          value: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { value: -1 },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
          count: 1,
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    console.error("Category breakdown error:", err);
    res.status(500).json({ message: "Failed to fetch category data" });
  }
});

/**
 * GET /api/analytics/daily-trend
 * Returns: daily spending trend for chart visualization
 * Query: month (YYYY-MM format, optional - defaults to current month)
 */
router.get("/daily-trend", authMiddleware, async (req, res) => {
  try {
    const { month } = req.query;

    // Build match stage
    const matchStage = {
      userId: new mongoose.Types.ObjectId(req.user.id),
    };

    if (month) {
      const [year, monthNum] = month.split("-");
      const start = new Date(`${year}-${monthNum}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      matchStage.date = { $gte: start, $lt: end };
    }

    const data = await Expense.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          amount: 1,
          count: 1,
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    console.error("Daily trend error:", err);
    res.status(500).json({ message: "Failed to fetch trend" });
  }
});

/**
 * GET /api/analytics/stats
 * Returns: overall statistics (all time)
 */
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const result = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
          count: { $sum: 1 },
          avgTransaction: { $avg: "$amount" },
          maxTransaction: { $max: "$amount" },
          minTransaction: { $min: "$amount" },
        },
      },
    ]);

    const data = result[0] || {
      totalSpent: 0,
      count: 0,
      avgTransaction: 0,
      maxTransaction: 0,
      minTransaction: 0,
    };

    res.json(data);
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

module.exports = router;
