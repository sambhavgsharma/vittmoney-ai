const express = require("express");
const router = express.Router();
const Expense = require("../Models/Expense");
const authMiddleware = require("../middleware/auth");

// Create Expense
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { amount, description, date, paymentMethod } = req.body;

    if (!amount || !description || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const expense = await Expense.create({
      userId: req.user.id,
      amount,
      description,
      date,
      paymentMethod: paymentMethod || "other",
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error("Create expense error:", err);
    res.status(500).json({ message: "Failed to create expense" });
  }
});

// List Expenses (Paginated)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const expenses = await Expense.find({ userId: req.user.id })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Expense.countDocuments({ userId: req.user.id });

    res.json({
      data: expenses,
      pagination: {
        total,
        page,
        limit,
      },
    });
  } catch (err) {
    console.error("Fetch expenses error:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// Update Expense
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, date, paymentMethod, category } = req.body;

    // Verify ownership
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update allowed fields
    if (amount !== undefined) expense.amount = amount;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = date;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (category !== undefined) expense.category = category;

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error("Update expense error:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
});

// Delete Expense
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Expense.deleteOne({ _id: id });
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Delete expense error:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

module.exports = router;
