const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  amount: {
    type: Number,
    required: true,
    min: [0.01, "Amount must be greater than 0"],
    max: [99999999, "Amount cannot exceed 99,999,999"], // ~100 million limit
    validate: {
      validator: function(v) {
        // Check for valid number, not NaN, not Infinity
        return Number.isFinite(v) && v > 0 && v <= 99999999;
      },
      message: "Amount must be a valid number between 0.01 and 99,999,999"
    }
  },

  currency: {
    type: String,
    default: "INR",
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  category: {
    type: String,
    default: null, // AI will fill this later
  },

  subcategory: {
    type: String,
    default: null,
  },

  paymentMethod: {
    type: String,
    enum: ["cash", "card", "upi", "bank", "other"],
    default: "other",
  },

  merchant: {
    type: String,
    default: null, // inferred later
  },

  date: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Expense", expenseSchema);
