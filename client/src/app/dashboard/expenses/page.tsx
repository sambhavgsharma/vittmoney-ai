"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useSwitchMode } from "@/components/SwitchMode";
import { safeLocalStorage } from "@/lib/safeLocalStorage";
import Card from "@/components/Card";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import gsap from "gsap";
import { Wallet, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Expense {
  _id: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: string;
  category?: string;
  currency: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
}

export default function ExpensesPage() {
  const { theme } = useSwitchMode();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Refs for animations
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const expenseItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "other",
    category: "",
  });

  // Fetch expenses
  const fetchExpenses = async (page: number = 1) => {
    try {
      setLoading(true);
      
      // First, classify any pending expenses
      try {
        await apiFetch("/expenses/classify-pending", {
          method: "POST",
        });
      } catch (err) {
        // Don't fail if classification fails - just log it
        console.warn("Could not classify pending expenses:", err);
      }
      
      // Then fetch updated expenses
      const data = await apiFetch(`/expenses?limit=10&page=${page}`);
      setExpenses(data.data);
      setPagination(data.pagination);

      // Animate expense items
      expenseItemsRef.current.forEach((item, index) => {
        if (!item) return;
        gsap.fromTo(
          item,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: index * 0.08,
            ease: "power3.out",
          }
        );
      });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  // Auto-poll for classified expenses (every 2 seconds)
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    let pollCount = 0;
    const maxPolls = 30; // Max 60 seconds of polling

    pollingIntervalRef.current = setInterval(async () => {
      pollCount++;
      
      try {
        const data = await apiFetch(`/expenses?limit=10&page=${pagination.page}`);
        // Update expenses to show newly classified ones
        setExpenses(data.data);
        
        // Check if any unclassified expenses exist
        const hasUnclassified = data.data.some((exp: Expense) => !exp.category);
        
        // Stop polling if all are classified or max polls reached
        if (!hasUnclassified || pollCount >= maxPolls) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          if (pollCount >= maxPolls && hasUnclassified) {
            console.warn("Max polling attempts reached, some expenses still unclassified");
            toast.error("Some expenses could not be classified. Please try refreshing the page.");
          }
        }
      } catch (error) {
        console.error("Error polling expenses:", error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses();
    
    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, []);

  // GSAP intro animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }

    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" }
      );
    }

    if (listRef.current) {
      gsap.fromTo(
        listRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: "power3.out" }
      );
    }
  }, []);

  // Handle form input
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    
    // Special handling for amount input
    if (name === "amount") {
      // Remove non-numeric characters except decimal point
      let cleanedValue = value.replace(/[^\d.]/g, "");
      
      // Prevent multiple decimal points
      const decimalCount = (cleanedValue.match(/\./g) || []).length;
      if (decimalCount > 1) {
        cleanedValue = cleanedValue.replace(/\.(?=.*\.)/, "");
      }
      
      // Convert to number and check limit
      const numValue = parseFloat(cleanedValue);
      if (!isNaN(numValue) && numValue > 99999999) {
        toast.error("Amount cannot exceed 99,999,999");
        cleanedValue = "99999999";
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: cleanedValue,
      }));
    } else if (name === "description") {
      // Limit description to 200 characters
      const trimmed = value.substring(0, 200);
      setFormData((prev) => ({
        ...prev,
        [name]: trimmed,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Enhanced validation
    const amount = parseFloat(formData.amount);
    const description = formData.description.trim();
    const date = formData.date;

    // Validate amount
    if (!formData.amount) {
      toast.error("Please enter an amount");
      return;
    }
    
    if (isNaN(amount) || !Number.isFinite(amount)) {
      toast.error("Amount must be a valid number");
      return;
    }
    
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    
    if (amount > 99999999) {
      toast.error("Amount cannot exceed 99,999,999 (limit set to prevent overflow)");
      return;
    }

    // Validate description
    if (!description) {
      toast.error("Please enter a description");
      return;
    }

    if (description.length < 3) {
      toast.error("Description must be at least 3 characters");
      return;
    }

    if (description.length > 200) {
      toast.error("Description cannot exceed 200 characters");
      return;
    }

    // Validate date
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    // Check if date is not in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      toast.error("Date cannot be in the future");
      return;
    }

    try {
      setSubmitting(true);

      const newExpense = await apiFetch("/expenses", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          description: description,
          amount: amount,
          category: formData.category || null, // Use manual if set, else null for server to classify
        }),
      });

      setExpenses([newExpense, ...expenses]);
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "other",
        category: "",
      });
      
      // Start polling to show category as soon as it's classified
      startPolling();
      
      toast.success("Expense added successfully!");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete expense
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await apiFetch(`/expenses/${id}`, {
        method: "DELETE",
      });
      setExpenses(expenses.filter((exp) => exp._id !== id));
      toast.success("Expense deleted successfully!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const inputBgClass =
    theme === "light"
      ? "bg-white/40 border-[#99FF77]/30 text-[#1e1a2b] placeholder:text-[#1e1a2b]/40"
      : "bg-white/5 border-white/20 text-white placeholder:text-white/40";

  const textPrimaryClass = theme === "light" ? "text-[#1e1a2b]" : "text-white";
  const textSecondaryClass =
    theme === "light" ? "text-[#1e1a2b]/70" : "text-white/70";
  const accentColor = theme === "light" ? "#99FF77" : "#66FF99";
  const accentColorLight =
    theme === "light" ? "#99FF77" : "#66FF99";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div
        ref={headerRef}
        className={`flex items-start justify-between ${theme === "light" ? "text-[#1e1a2b]" : "text-white"}`}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                theme === "light"
                  ? "bg-[#99FF77]/20 text-[#99FF77]"
                  : "bg-[#66FF99]/20 text-[#66FF99]"
              }`}
            >
              <Wallet size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Expenses</h1>
          </div>
          <p className={textSecondaryClass}>
            Track and manage your spending habits
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Expense Form */}
        <div ref={formRef} className="lg:col-span-1">
          <Card
            className={`flex flex-col backdrop-blur-xl ${
              theme === "light"
                ? "bg-gradient-to-br from-[#f7f6ff]/80 via-[#e6ffe0]/70 to-[#99FF77]/10"
                : "bg-gradient-to-br from-white/10 via-white/5 to-[#66FF99]/5"
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  theme === "light"
                    ? "bg-[#99FF77]/30 text-[#99FF77]"
                    : "bg-[#66FF99]/20 text-[#66FF99]"
                }`}
              >
                <Wallet size={18} />
              </div>
              <h2 className={`text-lg font-semibold ${textPrimaryClass}`}>
                Add Expense
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${textPrimaryClass}`}
                >
                  Amount <span className="text-red-400">*</span>
                  <span className={`text-xs ${textSecondaryClass} ml-1`}>
                    (Max: 99,999,999)
                  </span>
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  inputMode="decimal"
                  className={`w-full px-3 py-2.5 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#66FF99] transition-all ${inputBgClass}`}
                />
                {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                  <p className={`text-xs mt-1 ${textSecondaryClass}`}>
                    {formatCurrency(parseFloat(formData.amount))}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${textPrimaryClass}`}
                >
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="E.g., Lunch at restaurant..."
                  rows={3}
                  className={`w-full px-3 py-2.5 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#66FF99] resize-none transition-all ${inputBgClass}`}
                />
              </div>

              {/* Date */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${textPrimaryClass}`}
                >
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2.5 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#66FF99] transition-all ${inputBgClass}`}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${textPrimaryClass}`}
                >
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2.5 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#66FF99] transition-all ${inputBgClass}`}
                >
                  <option value="other">Other</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              {/* Category (Optional Override) */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${textPrimaryClass}`}
                >
                  Category <span className="text-xs text-gray-400">(Optional - AI will auto-classify)</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2.5 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#66FF99] transition-all ${inputBgClass}`}
                >
                  <option value="">Auto-classify</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Health">Health</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full h-10 rounded-full font-semibold transition-all duration-300 text-neutral-900 border ${
                  submitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 hover:shadow-lg"
                } bg-[#66FF99] border-[#66FF99] hover:bg-[#66FD88] shadow-lg`}
              >
                {submitting ? "Adding..." : "Add Expense"}
              </button>
            </form>
          </Card>
        </div>

        {/* Expenses List */}
        <div ref={listRef} className="lg:col-span-2">
          <Card
            className={`flex flex-col backdrop-blur-xl h-fit ${
              theme === "light"
                ? "bg-gradient-to-br from-[#f7f6ff]/80 via-[#e6ffe0]/70 to-[#99FF77]/10"
                : "bg-gradient-to-br from-white/10 via-white/5 to-[#66FF99]/5"
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  theme === "light"
                    ? "bg-[#99FF77]/30 text-[#99FF77]"
                    : "bg-[#66FF99]/20 text-[#66FF99]"
                }`}
              >
                <Wallet size={18} />
              </div>
              <h2 className={`text-lg font-semibold ${textPrimaryClass}`}>
                Recent Expenses
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="animate-spin rounded-full h-8 w-8 border-2"
                    style={{
                      borderColor: accentColor,
                      borderTopColor: "transparent",
                    }}
                  />
                  <p className={`text-sm ${textSecondaryClass}`}>
                    Loading expenses...
                  </p>
                </div>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-16">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    theme === "light"
                      ? "bg-[#99FF77]/10 text-[#99FF77]"
                      : "bg-[#66FF99]/10 text-[#66FF99]"
                  }`}
                >
                  <Wallet size={32} />
                </div>
                <p className={`${textSecondaryClass} mb-2`}>
                  No expenses yet
                </p>
                <p className="text-xs text-gray-400">
                  Add your first expense to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {expenses.map((expense, index) => (
                  <div
                    key={expense._id}
                    ref={(el) => {
                      expenseItemsRef.current[index] = el;
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      theme === "light"
                        ? "bg-white/30 border-[#99FF77]/20 hover:bg-white/40 hover:border-[#99FF77]/40"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#66FF99]/30"
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className={`font-medium ${textPrimaryClass}`}>
                        {expense.description}
                      </h3>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className={textSecondaryClass}>
                          {formatDate(expense.date)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full capitalize ${
                            theme === "light"
                              ? "bg-[#99FF77]/10 text-[#99FF77]"
                              : "bg-[#66FF99]/10 text-[#66FF99]"
                          }`}
                        >
                          {expense.paymentMethod}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            expense.category
                              ? theme === "light"
                                ? "bg-blue-100/50 text-blue-600"
                                : "bg-blue-900/30 text-blue-300"
                              : theme === "light"
                              ? "bg-gray-200/50 text-gray-600 animate-pulse"
                              : "bg-gray-700/30 text-gray-400 animate-pulse"
                          }`}
                        >
                          {expense.category ?? "Classifying…"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      <span className={`font-semibold text-base ${textPrimaryClass}`}>
                        {formatCurrency(expense.amount)}
                      </span>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          theme === "light"
                            ? "hover:bg-red-500/20 text-red-600"
                            : "hover:bg-red-500/20 text-red-400"
                        }`}
                        title="Delete expense"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && expenses.length > 0 && (
              <div
                className={`mt-6 flex items-center justify-between border-t pt-4 ${
                  theme === "light"
                    ? "border-[#99FF77]/20"
                    : "border-white/10"
                }`}
              >
                <p className={`text-xs ${textSecondaryClass}`}>
                  {pagination.total > 0
                    ? `Showing ${expenses.length} of ${pagination.total} expenses`
                    : "No expenses"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchExpenses(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`p-2 rounded-lg transition-all ${
                      pagination.page === 1
                        ? "opacity-40 cursor-not-allowed"
                        : theme === "light"
                        ? "hover:bg-[#99FF77]/20 text-[#99FF77]"
                        : "hover:bg-[#66FF99]/20 text-[#66FF99]"
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className={`px-3 py-1 text-sm font-medium ${textPrimaryClass}`}>
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => fetchExpenses(pagination.page + 1)}
                    disabled={
                      pagination.page * pagination.limit >= pagination.total
                    }
                    className={`p-2 rounded-lg transition-all ${
                      pagination.page * pagination.limit >= pagination.total
                        ? "opacity-40 cursor-not-allowed"
                        : theme === "light"
                        ? "hover:bg-[#99FF77]/20 text-[#99FF77]"
                        : "hover:bg-[#66FF99]/20 text-[#66FF99]"
                    }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
