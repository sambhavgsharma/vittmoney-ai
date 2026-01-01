"use client";

import { useSwitchMode } from "@/components/SwitchMode";
import Card from "@/components/Card";
import { TrendingUp, TrendingDown, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { safeLocalStorage } from "@/lib/safeLocalStorage";

interface ExpenseData {
  totalExpenses: number;
  monthlyAverage: number;
  trend: number;
  expenseCount: number;
  hasExpenses: boolean;
}

export default function BalanceSummary() {
  const { theme } = useSwitchMode();
  const [data, setData] = useState<ExpenseData>({
    totalExpenses: 0,
    monthlyAverage: 0,
    trend: 0,
    expenseCount: 0,
    hasExpenses: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const token = safeLocalStorage.get("token");
        const apiBase = process.env.NEXT_PUBLIC_API_BASE;
        
        const res = await fetch(`${apiBase}/analytics/dashboard-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const result = await res.json();
          // Ensure all values are numbers, default to 0 if null
          setData({
            totalExpenses: result.totalExpenses ?? 0,
            monthlyAverage: result.monthlyAverage ?? 0,
            trend: result.trend ?? 0,
            expenseCount: result.expenseCount ?? 0,
            hasExpenses: result.hasExpenses ?? false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenseData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card
            key={i}
            className={`p-6 rounded-2xl border-0 backdrop-blur-xl ${
              theme === "light"
                ? "bg-gradient-to-br from-white/80 to-white/40 border border-white/40"
                : "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
            }`}
          >
            <div className="flex items-center justify-center h-24">
              <Loader className="animate-spin text-[#66FF99]" size={24} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data.hasExpenses) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Expenses", icon: TrendingDown, color: "red" },
          { label: "Monthly Average", icon: TrendingDown, color: "blue" },
          { label: "Trend (vs last month)", icon: TrendingUp, color: "green" },
        ].map((item, i) => {
          const Icon = item.icon;
          const colorMap = {
            red: theme === "light" ? "bg-red-100/50" : "bg-red-500/10 border border-red-500/20",
            blue: theme === "light" ? "bg-blue-100/50" : "bg-blue-500/10 border border-blue-500/20",
            green: theme === "light" ? "bg-green-100/50" : "bg-green-500/10 border border-green-500/20",
          };
          const iconColorMap = {
            red: "text-red-500",
            blue: "text-blue-500",
            green: "text-green-500",
          };
          return (
            <Card
              key={i}
              className={`p-6 rounded-2xl border-0 backdrop-blur-xl transition-all duration-300 flex flex-col items-center justify-center min-h-[160px] ${
                theme === "light"
                  ? "bg-gradient-to-br from-white/80 to-white/40 border border-white/40"
                  : "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorMap[item.color as keyof typeof colorMap]}`}>
                <Icon className={`${iconColorMap[item.color as keyof typeof iconColorMap]}`} size={24} />
              </div>
              <p
                className={`text-sm font-medium text-center ${
                  theme === "light" ? "text-gray-600" : "text-white/70"
                }`}
              >
                {item.label}
              </p>
              <p className="text-xs text-gray-500 mt-2 text-center">Add expenses to unlock</p>
            </Card>
          );
        })}
      </div>
    );
  }

  const isPositiveTrend = data.trend > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total Expenses */}
      <Card
        className={`p-6 rounded-2xl border-0 backdrop-blur-xl transition-all duration-300 hover:shadow-lg ${
          theme === "light"
            ? "bg-gradient-to-br from-white/80 to-white/40 border border-white/40"
            : "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className={`text-sm font-medium mb-1 ${
                theme === "light" ? "text-gray-600" : "text-white/70"
              }`}
            >
              Total Expenses
            </p>
            <p
              className={`text-3xl font-bold ${
                theme === "light" ? "text-[#1e1a2b]" : "text-white"
              }`}
            >
              ${(data.totalExpenses || 0).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              theme === "light"
                ? "bg-red-100/50"
                : "bg-red-500/10 border border-red-500/20"
            }`}
          >
            <TrendingDown className="text-red-500" size={24} />
          </div>
        </div>
        <p className="text-xs text-gray-500">{data.expenseCount || 0} transactions</p>
      </Card>

      {/* Monthly Average */}
      <Card
        className={`p-6 rounded-2xl border-0 backdrop-blur-xl transition-all duration-300 hover:shadow-lg ${
          theme === "light"
            ? "bg-gradient-to-br from-white/80 to-white/40 border border-white/40"
            : "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className={`text-sm font-medium mb-1 ${
                theme === "light" ? "text-gray-600" : "text-white/70"
              }`}
            >
              Monthly Average
            </p>
            <p
              className={`text-3xl font-bold ${
                theme === "light" ? "text-[#1e1a2b]" : "text-white"
              }`}
            >
              ${(data.monthlyAverage || 0).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              theme === "light"
                ? "bg-blue-100/50"
                : "bg-blue-500/10 border border-blue-500/20"
            }`}
          >
            <TrendingDown className="text-blue-500" size={24} />
          </div>
        </div>
        <p className="text-xs text-gray-500">Per month</p>
      </Card>

      {/* Trend */}
      <Card
        className={`p-6 rounded-2xl border-0 backdrop-blur-xl transition-all duration-300 hover:shadow-lg ${
          theme === "light"
            ? "bg-gradient-to-br from-white/80 to-white/40 border border-white/40"
            : "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className={`text-sm font-medium mb-1 ${
                theme === "light" ? "text-gray-600" : "text-white/70"
              }`}
            >
              Trend (vs last month)
            </p>
            <p
              className={`text-3xl font-bold ${
                isPositiveTrend ? "text-red-500" : "text-green-500"
              }`}
            >
              {isPositiveTrend ? "+" : ""}{(data.trend || 0).toFixed(1)}%
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isPositiveTrend
                ? theme === "light"
                  ? "bg-red-100/50"
                  : "bg-red-500/10 border border-red-500/20"
                : theme === "light"
                  ? "bg-green-100/50"
                  : "bg-green-500/10 border border-green-500/20"
            }`}
          >
            {isPositiveTrend ? (
              <TrendingUp className={`${isPositiveTrend ? "text-red-500" : "text-green-500"}`} size={24} />
            ) : (
              <TrendingDown className={`${isPositiveTrend ? "text-red-500" : "text-green-500"}`} size={24} />
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">{isPositiveTrend ? "Increase" : "Decrease"}</p>
      </Card>
    </div>
  );
}
