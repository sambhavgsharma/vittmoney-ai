"use client";

import { useSwitchMode } from "@/components/SwitchMode";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import { safeLocalStorage } from "@/lib/safeLocalStorage";
import { ChevronRight, Loader } from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  "Food & Dining": "#FF6B6B",
  Transport: "#4ECDC4",
  Shopping: "#95E1D3",
  Entertainment: "#FFD93D",
  Utilities: "#6BCB77",
  "Uncategorized": "#A8A8A8",
};

export default function RecentTransactions() {
  const { theme } = useSwitchMode();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExpenses, setHasExpenses] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = safeLocalStorage.get("token");
        const apiBase = process.env.NEXT_PUBLIC_API_BASE;
        const res = await fetch(`${apiBase}/analytics/recent-transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const result = await res.json();
          if (Array.isArray(result) && result.length > 0) {
            setTransactions(result);
            setHasExpenses(true);
          } else {
            setHasExpenses(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <Card
        className={`p-6 rounded-2xl border-0 backdrop-blur-xl flex items-center justify-center min-h-[300px] ${
          theme === "light"
            ? "bg-gradient-to-br from-white/80 to-white/40 border border-white/40"
            : "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        }`}
      >
        <Loader className="animate-spin text-[#66FF99]" size={32} />
      </Card>
    );
  }

  if (!hasExpenses) {
    return (
      <Card
        className={`p-6 rounded-2xl border-0 backdrop-blur-xl ${
          theme === "light"
            ? "bg-gradient-to-br from-white/80 to-white/40 border border-white/40"
            : "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        }`}
      >
        <h3
          className={`text-xl font-bold mb-6 ${
            theme === "light" ? "text-[#1e1a2b]" : "text-white"
          }`}
        >
          Recent Transactions
        </h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              theme === "light"
                ? "bg-gray-200/50"
                : "bg-white/10"
            }`}
          >
            <span className="text-3xl">💳</span>
          </div>
          <p
            className={`text-sm font-medium mb-2 ${
              theme === "light" ? "text-gray-600" : "text-white/70"
            }`}
          >
            No transactions yet
          </p>
          <p
            className={`text-xs text-center mb-4 ${
              theme === "light" ? "text-gray-500" : "text-white/50"
            }`}
          >
            Start by adding your first expense to see it here
          </p>
          <Link
            href="/dashboard/expenses"
            className="text-[#66FF99] hover:text-[#66FF99]/80 transition-colors text-sm font-medium"
          >
            Add Expense →
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`p-6 rounded-2xl border-0 backdrop-blur-xl ${
        theme === "light"
          ? "bg-gradient-to-br from-white/80 to-white/40 border border-white/40"
          : "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-xl font-bold ${
            theme === "light" ? "text-[#1e1a2b]" : "text-white"
          }`}
        >
          Recent Transactions
        </h3>
        <Link
          href="/dashboard/expenses"
          className="text-[#66FF99] hover:text-[#66FF99]/80 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          View All
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => {
          const color =
            CATEGORY_COLORS[transaction.category] ||
            CATEGORY_COLORS["Uncategorized"];
          return (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-white/5 ${
                theme === "light"
                  ? "bg-white/30 hover:bg-white/50"
                  : "bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                  style={{
                    backgroundColor: color,
                    opacity: 0.7,
                  }}
                >
                  {transaction.category.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      theme === "light" ? "text-[#1e1a2b]" : "text-white"
                    }`}
                  >
                    {transaction.description}
                  </p>
                  <p
                    className={`text-xs ${
                      theme === "light" ? "text-gray-600" : "text-white/50"
                    }`}
                  >
                    {transaction.date}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-semibold ml-4 ${
                  theme === "light" ? "text-[#1e1a2b]" : "text-white"
                }`}
              >
                -${transaction.amount.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
