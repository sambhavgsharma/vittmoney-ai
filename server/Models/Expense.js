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
    min: 0,
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
