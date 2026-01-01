"use client";

import { useSwitchMode } from "@/components/SwitchMode";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import { safeLocalStorage } from "@/lib/safeLocalStorage";
import { Loader } from "lucide-react";

interface Category {
  name: string;
  amount: number;
  percentage: number;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  "Food & Dining": "#FF6B6B",
  Transport: "#4ECDC4",
  Shopping: "#95E1D3",
  Entertainment: "#FFD93D",
  Utilities: "#6BCB77",
  "Uncategorized": "#A8A8A8",
};

export default function CategoryBreakdown() {
  const { theme } = useSwitchMode();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExpenses, setHasExpenses] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = safeLocalStorage.get("token");
        const apiBase = process.env.NEXT_PUBLIC_API_BASE;
        const res = await fetch(`${apiBase}/analytics/category-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const result = await res.json();
          if (Array.isArray(result) && result.length > 0) {
            setCategories(result);
            setHasExpenses(true);
          } else {
            setHasExpenses(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Card
        className={`p-6 rounded-2xl border-0 backdrop-blur-xl flex items-center justify-center min-h-[400px] ${
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
          Spending by Category
        </h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              theme === "light"
                ? "bg-gray-200/50"
                : "bg-white/10"
            }`}
          >
            <span className="text-3xl">📊</span>
          </div>
          <p
            className={`text-sm font-medium mb-2 ${
              theme === "light" ? "text-gray-600" : "text-white/70"
            }`}
          >
            No spending data yet
          </p>
          <p
            className={`text-xs text-center ${
              theme === "light" ? "text-gray-500" : "text-white/50"
            }`}
          >
            Add expenses to see your spending breakdown by category
          </p>
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
      <h3
        className={`text-xl font-bold mb-6 ${
          theme === "light" ? "text-[#1e1a2b]" : "text-white"
        }`}
      >
        Spending by Category
      </h3>

      <div className="space-y-4">
        {categories.map((category) => {
          const color = CATEGORY_COLORS[category.name] || CATEGORY_COLORS["Uncategorized"];
          return (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <p
                    className={`text-sm font-medium ${
                      theme === "light" ? "text-gray-700" : "text-white/80"
                    }`}
                  >
                    {category.name}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    theme === "light" ? "text-[#1e1a2b]" : "text-white"
                  }`}
                >
                  ${category.amount.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div
                className={`w-full h-2 rounded-full overflow-hidden ${
                  theme === "light"
                    ? "bg-gray-200/50"
                    : "bg-white/5"
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: color,
                    opacity: 0.8,
                  }}
                />
              </div>
              <p
                className={`text-xs ${
                  theme === "light" ? "text-gray-500" : "text-white/50"
                }`}
              >
                {category.percentage}% of total
              </p>
            </div>
          );
        })}
      </div>

      <div
        className={`mt-6 pt-6 border-t ${
          theme === "light"
            ? "border-gray-200/50"
            : "border-white/5"
        }`}
      >
        <p
          className={`text-sm ${
            theme === "light" ? "text-gray-600" : "text-white/60"
          }`}
        >
          Showing top {categories.length} categories
        </p>
      </div>
    </Card>
  );
}
