const express = require("express");
const router = express.Router();
const Expense = require("../Models/Expense");
const authMiddleware = require("../middleware/auth");
const { classifyExpense } = require("../services/nlpService");

// Create Expense
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { amount, description, date, paymentMethod } = req.body;

    // Validate required fields
    if (!amount || !description || !date) {
      return res.status(400).json({ message: "Missing required fields: amount, description, date" });
    }

    // Validate and sanitize amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !Number.isFinite(numAmount)) {
      return res.status(400).json({ message: "Amount must be a valid number" });
    }
    if (numAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (numAmount > 99999999) {
      return res.status(400).json({ 
        message: "Amount cannot exceed 99,999,999 (limit set to prevent overflow)" 
      });
    }

    // Validate description
    const trimmedDesc = String(description).trim();
    if (trimmedDesc.length < 3) {
      return res.status(400).json({ message: "Description must be at least 3 characters" });
    }
    if (trimmedDesc.length > 200) {
      return res.status(400).json({ message: "Description cannot exceed 200 characters" });
    }

    // Validate date (not in future)
    const expenseDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (expenseDate > today) {
      return res.status(400).json({ message: "Expense date cannot be in the future" });
    }

    const expense = await Expense.create({
      userId: req.user.id,
      amount: numAmount,
      description: trimmedDesc,
      date: expenseDate,
      paymentMethod: paymentMethod || "other",
    });

    // 🔥 async ML classification (non-blocking with timeout + error handling)
    const classifyPromise = classifyExpense(trimmedDesc);

    // Add 8 second timeout to prevent hanging
    Promise.race([
      classifyPromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Classification timeout (>8s)")),
          8000
        )
      ),
    ])
      .then((result) => {
        console.log(`📊 Classification result for "${trimmedDesc.substring(0, 30)}...": ${JSON.stringify(result)}`);
        
        // Update category if we have a result (even with lower confidence)
        if (result && result.category && typeof result.category === "string") {
          const confidence = parseFloat(result.confidence) || 0;
          console.log(`✅ Updating expense ${expense._id} with category: ${result.category} (${(confidence * 100).toFixed(1)}%)`);
          
          Expense.findByIdAndUpdate(expense._id, {
            category: result.category,
          }).exec()
            .then(() => console.log(`✅ Successfully updated expense ${expense._id}`))
            .catch(err => console.error(`❌ Failed to update expense ${expense._id}:`, err));
        } else {
          console.warn(`⚠️ Invalid classification result for expense ${expense._id}:`, result);
        }
      })
      .catch((err) => {
        // Log but don't crash - user can set category manually
        console.error(
          `❌ Classification failed for expense ${expense._id}: ${err.message}`
        );
      });

    res.status(201).json(expense);
  } catch (err) {
    console.error("Create expense error:", err);
    
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
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

// Classify Expense using ML service
router.post("/classify", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text field is required" });
    }

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:7860";
    const response = await fetch(`${ML_SERVICE_URL}/classify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`ML service error: ${response.statusText}`);
    }

    const classificationResult = await response.json();
    res.json(classificationResult);
  } catch (err) {
    console.error("Classify expense error:", err);
    res.status(500).json({ message: "Failed to classify expense" });
  }
});

// Classify all pending expenses for user (used when page loads)
router.post("/classify-pending", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all unclassified expenses for this user
    const pendingExpenses = await Expense.find({
      userId,
      category: { $in: [null, "", undefined] },
    }).limit(50); // Limit to 50 per request to avoid overload

    if (pendingExpenses.length === 0) {
      return res.json({
        message: "No pending expenses to classify",
        count: 0,
      });
    }

    // Classify each one
    for (const expense of pendingExpenses) {
      try {
        const result = await classifyExpense(expense.description);
        
        // Only update if we got a result with high confidence
        if (result && result.confidence >= 0.5) {
          await Expense.findByIdAndUpdate(expense._id, {
            category: result.category,
          });
          console.log(
            `✅ Classified pending expense: ${expense.description} → ${result.category}`
          );
        }
      } catch (err) {
        console.warn(
          `Failed to classify pending expense ${expense._id}: ${err.message}`
        );
      }
    }

    // Return updated expenses
    const updatedExpenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(10);

    res.json({
      message: `Successfully classified ${pendingExpenses.length} pending expenses`,
      count: pendingExpenses.length,
      expenses: updatedExpenses,
    });
  } catch (err) {
    console.error("Classify pending expenses error:", err);
    res.status(500).json({ message: "Failed to classify pending expenses" });
  }
});

module.exports = router;
