"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { safeLocalStorage } from "@/lib/safeLocalStorage";
import Card from "@/components/Card";
import StatCard from "@/components/analytics/StatCard";
import ChartContainer from "@/components/analytics/ChartContainer";
import Loader from "@/components/Loader";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Calendar } from "lucide-react";

interface SummaryData {
  totalSpent: number;
  count: number;
  avgPerDay: number;
  month: string;
}

interface CategoryData {
  name: string;
  value: number;
  count: number;
}

interface TrendData {
  date: string;
  amount: number;
  count: number;
}

interface StatsData {
  totalSpent: number;
  count: number;
  avgTransaction: number;
  maxTransaction: number;
  minTransaction: number;
}

const COLORS = [
  "#66FF99",
  "#00D9FF",
  "#FFD700",
  "#FF6B9D",
  "#00FF88",
  "#00E5FF",
  "#FF9500",
  "#66FF99",
];

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [allTimeStats, setAllTimeStats] = useState<StatsData | null>(null);

  // UI states
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  const apiBase = process.env.NEXT_PUBLIC_API_BASE;

  // Fetch all analytics data
  const fetchAnalyticsData = async (month: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = safeLocalStorage.get("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      if (!apiBase) {
        setError("API base URL not configured. Please check environment variables.");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      console.log("Fetching analytics data for month:", month);
      console.log("API Base:", apiBase);

      // Fetch all data in parallel
      const [summaryRes, categoriesRes, trendsRes, statsRes] = await Promise.all([
        fetch(`${apiBase}/analytics/summary?month=${month}`, { headers }),
        fetch(`${apiBase}/analytics/category-breakdown?month=${month}`, { headers }),
        fetch(`${apiBase}/analytics/daily-trend?month=${month}`, { headers }),
        fetch(`${apiBase}/analytics/stats`, { headers }),
      ]);

      // Check each response and provide detailed error info
      if (!summaryRes.ok) {
        const errData = await summaryRes.text();
        throw new Error(`Summary API failed (${summaryRes.status}): ${errData}`);
      }
      if (!categoriesRes.ok) {
        const errData = await categoriesRes.text();
        throw new Error(`Categories API failed (${categoriesRes.status}): ${errData}`);
      }
      if (!trendsRes.ok) {
        const errData = await trendsRes.text();
        throw new Error(`Trends API failed (${trendsRes.status}): ${errData}`);
      }
      if (!statsRes.ok) {
        const errData = await statsRes.text();
        throw new Error(`Stats API failed (${statsRes.status}): ${errData}`);
      }

      const summaryData = await summaryRes.json();
      const categoriesData = await categoriesRes.json();
      const trendsData = await trendsRes.json();
      const statsData = await statsRes.json();

      setSummary(summaryData);
      setCategories(categoriesData);
      setTrends(trendsData);
      setAllTimeStats(statsData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(errorMsg);
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when month changes
  useEffect(() => {
    fetchAnalyticsData(selectedMonth);
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#66FF99] via-[#00D9FF] to-[#66FF99] bg-clip-text text-transparent mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-white/70 text-sm md:text-base mb-6">
          Track your spending patterns, trends, and insights at a glance.
        </p>

        {/* Month Selector */}
        <div className="flex items-center gap-2 md:gap-4">
          <Calendar className="w-5 h-5 text-[#66FF99]" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#0f1f1c]/40 border border-[#66FF99]/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#66FF99]/50 transition-all backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {error && (
          <Card className="border-[#66FF99]/50 bg-[#66FF99]/5 backdrop-blur-sm">
            <p className="text-[#66FF99]">{error}</p>
          </Card>
        )}

        {/* Stats Cards - Monthly */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard
              label="Total Spent"
              value={`₹${summary.totalSpent.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={<TrendingUp />}
              subtext={`${selectedMonth}`}
            />
            <StatCard
              label="Transactions"
              value={summary.count}
              icon={<BarChart3 />}
              subtext={`${summary.count} expenses`}
            />
            <StatCard
              label="Avg Per Day"
              value={`₹${summary.avgPerDay.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={<PieChartIcon />}
              subtext="Daily average"
            />
          </div>
        )}

        {/* All Time Stats */}
        {allTimeStats && (
          <ChartContainer
            title="All-Time Statistics"
            description="Your complete spending overview since account creation"
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 rounded-xl bg-[#0f1f1c]/30 border border-[#66FF99]/30 backdrop-blur-sm hover:border-[#66FF99]/70 transition">
                <p className="text-white/70 text-xs md:text-sm mb-2">Total Spent</p>
                <p className="text-lg md:text-xl font-bold text-[#66FF99] drop-shadow-[0_0_8px_rgba(102,255,153,0.5)]">
                  ₹{allTimeStats.totalSpent.toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#0f1f1c]/30 border border-[#00D9FF]/30 backdrop-blur-sm hover:border-[#00D9FF]/70 transition">
                <p className="text-white/70 text-xs md:text-sm mb-2">Total Transactions</p>
                <p className="text-lg md:text-xl font-bold text-[#00D9FF] drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]">
                  {allTimeStats.count}
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#0f1f1c]/30 border border-[#FFD700]/30 backdrop-blur-sm hover:border-[#FFD700]/70 transition">
                <p className="text-white/70 text-xs md:text-sm mb-2">Avg Per Transaction</p>
                <p className="text-lg md:text-xl font-bold text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
                  ₹{allTimeStats.avgTransaction.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#0f1f1c]/30 border border-[#FF6B9D]/30 backdrop-blur-sm hover:border-[#FF6B9D]/70 transition">
                <p className="text-white/70 text-xs md:text-sm mb-2">Highest</p>
                <p className="text-lg md:text-xl font-bold text-[#FF6B9D] drop-shadow-[0_0_8px_rgba(255,107,157,0.5)]">
                  ₹{allTimeStats.maxTransaction.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#0f1f1c]/30 border border-[#00FF88]/30 backdrop-blur-sm hover:border-[#00FF88]/70 transition">
                <p className="text-white/70 text-xs md:text-sm mb-2">Lowest</p>
                <p className="text-lg md:text-xl font-bold text-[#00FF88] drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]">
                  ₹{allTimeStats.minTransaction.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </ChartContainer>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart - Category Breakdown */}
          {categories.length > 0 && (
            <ChartContainer
              title="Spending by Category"
              description="Distribution of your expenses across categories"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: any) => {
                      const total = categories.reduce((sum, cat) => sum + cat.value, 0);
                      const percentage = ((value / total) * 100).toFixed(0);
                      return `${name} ${percentage}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 31, 28, 0.95)",
                      border: "1px solid rgba(102, 255, 153, 0.4)",
                      borderRadius: "12px",
                      color: "rgb(102, 255, 153)",
                      boxShadow: "0 0 20px rgba(102, 255, 153, 0.25)",
                    }}
                    formatter={(value: number) =>
                      `₹${value.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Category List */}
              <div className="mt-6 space-y-2 max-h-48 overflow-y-auto">
                {categories.map((cat, index) => {
                  const total = categories.reduce((sum, c) => sum + c.value, 0);
                  const percentage = ((cat.value / total) * 100).toFixed(1);
                  return (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#0f1f1c]/40 border border-white/10 hover:border-[#66FF99]/50 transition backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-white/80">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          ₹{cat.value.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-white/60">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartContainer>
          )}

          {/* Line Chart - Daily Trend */}
          {trends.length > 0 && (
            <ChartContainer
              title="Daily Spending Trend"
              description={`Spending pattern for ${selectedMonth}`}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(102, 255, 153, 0.1)"
                    opacity={1}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(102, 255, 153, 0.6)"
                    tick={{ fontSize: 12, fill: "rgba(102, 255, 153, 0.6)" }}
                    tickFormatter={(date: any) => {
                      const d = new Date(date);
                      return `${d.getDate()}`;
                    }}
                  />
                  <YAxis
                    stroke="rgba(102, 255, 153, 0.6)"
                    tick={{ fontSize: 12, fill: "rgba(102, 255, 153, 0.6)" }}
                    tickFormatter={(value: any) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 31, 28, 0.95)",
                      border: "1px solid rgba(102, 255, 153, 0.4)",
                      borderRadius: "12px",
                      color: "rgb(102, 255, 153)",
                      boxShadow: "0 0 20px rgba(102, 255, 153, 0.25)",
                    }}
                    formatter={(value: number) => [
                      `₹${value.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`,
                      "Amount",
                    ]}
                    labelFormatter={(label: any) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#66FF99"
                    strokeWidth={2}
                    dot={{
                      fill: "#66FF99",
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#00D9FF",
                    }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Summary Info */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[#0f1f1c]/40 border border-[#66FF99]/30 backdrop-blur-sm">
                  <p className="text-xs text-white/60 mb-1">Peak Spending Day</p>
                  <p className="text-sm font-semibold text-[#66FF99]">
                    {trends.length > 0
                      ? (() => {
                          const maxTrend = trends.reduce((prev, current) =>
                            prev.amount > current.amount ? prev : current
                          );
                          return maxTrend.date;
                        })()
                      : "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#0f1f1c]/40 border border-[#66FF99]/30 backdrop-blur-sm">
                  <p className="text-xs text-white/60 mb-1">Avg Daily Spend</p>
                  <p className="text-sm font-semibold text-[#66FF99]">
                    ₹
                    {trends.length > 0
                      ? (
                          trends.reduce((sum, t) => sum + t.amount, 0) / trends.length
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "0.00"}
                  </p>
                </div>
              </div>
            </ChartContainer>
          )}
        </div>

        {/* Empty State */}
        {categories.length === 0 && trends.length === 0 && !error && (
          <Card className="text-center py-12 bg-[#0f1f1c]/30 border-[#66FF99]/30 backdrop-blur-sm hover:border-[#66FF99]/50">
            <p className="text-white/70 mb-4">
              No expenses recorded for {selectedMonth}
            </p>
            <p className="text-sm text-white/50">
              Start adding expenses to see your analytics
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
