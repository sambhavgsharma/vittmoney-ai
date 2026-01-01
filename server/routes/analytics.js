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
          _id: { $ifNull: ["$category", "Labelled"] },
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

/**
 * GET /api/analytics/dashboard-summary
 * Returns: all-time and monthly stats for dashboard KPIs
 */
router.get("/dashboard-summary", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // All-time stats
    const allTimeResult = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const allTimeData = allTimeResult[0] || { totalExpenses: 0, count: 0 };

    // Current month stats
    const currentMonthResult = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: currentMonth, $lt: nextMonth },
        },
      },
      {
        $group: {
          _id: null,
          currentMonthTotal: { $sum: "$amount" },
          currentMonthCount: { $sum: 1 },
        },
      },
    ]);

    const currentMonthData = currentMonthResult[0] || {
      currentMonthTotal: 0,
      currentMonthCount: 0,
    };

    // Previous month stats
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthResult = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: previousMonth, $lt: prevMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          prevMonthTotal: { $sum: "$amount" },
        },
      },
    ]);

    const prevMonthData = prevMonthResult[0] || { prevMonthTotal: 0 };

    // Calculate monthly average (safer approach)
    let monthlyAverage = 0;
    if (allTimeData.count > 0) {
      if (currentMonthData.currentMonthCount > 0) {
        // Use current month if it has data
        monthlyAverage = currentMonthData.currentMonthTotal;
      } else {
        // Otherwise, estimate: total / (1 to 6 months)
        // Conservative: assume data spans 3 months minimum
        monthlyAverage = allTimeData.totalExpenses / Math.max(1, Math.ceil(allTimeData.count / 15));
      }
    }

    // Trend: compare current month with previous month
    let trend = 0;
    if (prevMonthData.prevMonthTotal > 0) {
      trend = ((currentMonthData.currentMonthTotal - prevMonthData.prevMonthTotal) / 
               prevMonthData.prevMonthTotal) * 100;
    }

    res.json({
      totalExpenses: Math.round(allTimeData.totalExpenses * 100) / 100,
      monthlyAverage: Math.round(monthlyAverage * 100) / 100,
      trend: Math.round(trend * 10) / 10,
      expenseCount: allTimeData.count,
      hasExpenses: allTimeData.count > 0,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
});

/**
 * GET /api/analytics/category-summary
 * Returns: category breakdown with percentages
 */
router.get("/category-summary", authMiddleware, async (req, res) => {
  try {
    const categoryData = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$category", "Uncategorized"] },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { amount: -1 },
      },
    ]);

    if (categoryData.length === 0) {
      return res.json([]);
    }

    const totalAmount = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

    const formattedData = categoryData.map((cat) => ({
      name: cat._id,
      amount: Math.round(cat.amount * 100) / 100,
      percentage: Math.round((cat.amount / totalAmount) * 100),
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Category summary error:", err);
    res.status(500).json({ message: "Failed to fetch category summary" });
  }
});

/**
 * GET /api/analytics/recent-transactions
 * Returns: last 5 transactions with category info
 */
router.get("/recent-transactions", authMiddleware, async (req, res) => {
  try {
    const transactions = await Expense.find({
      userId: req.user.id,
    })
      .sort({ date: -1 })
      .limit(5)
      .select("_id description amount category date");

    const formattedTransactions = transactions.map((t) => ({
      id: t._id,
      description: t.description,
      amount: t.amount,
      category: t.category || "Uncategorized",
      date: new Date(t.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    res.json(formattedTransactions);
  } catch (err) {
    console.error("Recent transactions error:", err);
    res.status(500).json({ message: "Failed to fetch recent transactions" });
  }
});

/**
 * GET /api/analytics/insights
 * Returns: actionable insights based on spending patterns
 */
router.get("/insights", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get top spending category
    const topCategory = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: currentMonth, $lt: nextMonth },
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$category", "Uncategorized"] },
          amount: { $sum: "$amount" },
          percentage: {
            $sum: 1,
          },
        },
      },
      {
        $sort: { amount: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    // Get current month total
    const currentMonthTotal = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: currentMonth, $lt: nextMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Get previous month total
    const prevMonthTotal = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: previousMonth, $lt: prevMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const current = currentMonthTotal[0]?.total || 0;
    const previous = prevMonthTotal[0]?.total || 0;
    const topCat = topCategory[0];

    const insights = [];

    // Insight 1: Spending Peak
    if (topCat) {
      const totalCurrent = currentMonthTotal[0]?.total || 0;
      const percentage = totalCurrent > 0
        ? Math.round((topCat.amount / totalCurrent) * 100)
        : 0;
      insights.push({
        type: "spending-peak",
        title: "Spending Peak",
        description: `${topCat._id} is your highest category at ${percentage}% of spending`,
        action: "Review habits",
      });
    }

    // Insight 2: Budget Alert (mock - can be enhanced with actual budget system)
    if (current > 2000) {
      const exceeded = Math.round(current - 2000);
      insights.push({
        type: "budget-alert",
        title: "Budget Alert",
        description: `Your spending exceeded $2000 by $${exceeded} this month`,
        action: "View breakdown",
      });
    }

    // Insight 3: Great Saving
    if (previous > 0 && current < previous) {
      const saved = Math.round(previous - current);
      insights.push({
        type: "great-saving",
        title: "Great Saving",
        description: `You saved $${saved} more this month vs last month!`,
        action: "Keep it up",
      });
    }

    // Insight 4: Goal Progress (mock - can be enhanced with actual goals system)
    const monthlyGoal = 2500;
    const progress = Math.round((current / monthlyGoal) * 100);
    insights.push({
      type: "goal-progress",
      title: "Goal Progress",
      description: `You're ${Math.min(progress, 100)}% towards your monthly savings target`,
      action: "Adjust goal",
    });

    res.json(insights);
  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ message: "Failed to fetch insights" });
  }
});

module.exports = router;
