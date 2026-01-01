"use client";

import { useSwitchMode } from "@/components/SwitchMode";
import Card from "@/components/Card";
import {
  Zap,
  AlertCircle,
  Award,
  Target,
  Loader,
} from "lucide-react";
import { useEffect, useState } from "react";
import { safeLocalStorage } from "@/lib/safeLocalStorage";

interface Insight {
  type: string;
  title: string;
  description: string;
  action: string;
}

const INSIGHT_ICONS: { [key: string]: React.ReactNode } = {
  "spending-peak": <Zap className="w-5 h-5" />,
  "budget-alert": <AlertCircle className="w-5 h-5" />,
  "great-saving": <Award className="w-5 h-5" />,
  "goal-progress": <Target className="w-5 h-5" />,
};

const INSIGHT_COLORS: { [key: string]: string } = {
  "spending-peak": "text-orange-500",
  "budget-alert": "text-red-500",
  "great-saving": "text-green-500",
  "goal-progress": "text-blue-500",
};

const INSIGHT_BG_COLORS: { [key: string]: string } = {
  "spending-peak": "from-orange-500/10 to-orange-500/5",
  "budget-alert": "from-red-500/10 to-red-500/5",
  "great-saving": "from-green-500/10 to-green-500/5",
  "goal-progress": "from-blue-500/10 to-blue-500/5",
};

export default function InsightsCards() {
  const { theme } = useSwitchMode();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExpenses, setHasExpenses] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = safeLocalStorage.get("token");
        const apiBase = process.env.NEXT_PUBLIC_API_BASE;
        const res = await fetch(`${apiBase}/analytics/insights`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const result = await res.json();
          if (Array.isArray(result) && result.length > 0) {
            setInsights(result);
            setHasExpenses(true);
          } else {
            setHasExpenses(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch insights:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className={`p-4 rounded-xl border-0 backdrop-blur-sm flex items-center justify-center min-h-[140px] ${
              theme === "light"
                ? "bg-gradient-to-br from-white/80 to-white/40 border border-white/40"
                : "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
            }`}
          >
            <Loader className="animate-spin text-[#66FF99]" size={24} />
          </Card>
        ))}
      </div>
    );
  }

  if (!hasExpenses) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          { title: "Spending Peak", icon: "spending-peak" },
          { title: "Budget Alert", icon: "budget-alert" },
          { title: "Great Saving", icon: "great-saving" },
          { title: "Goal Progress", icon: "goal-progress" },
        ].map((item, index) => (
          <Card
            key={index}
            className={`p-4 rounded-xl border-0 backdrop-blur-sm flex flex-col items-center justify-center min-h-[140px] ${
              theme === "light"
                ? "bg-gradient-to-br from-white/80 to-white/40 border border-white/40"
                : "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
            }`}
          >
            <div
              className={`text-2xl mb-2 opacity-50`}
            >
              {INSIGHT_ICONS[item.icon]}
            </div>
            <p
              className={`text-sm font-semibold text-center ${
                theme === "light" ? "text-gray-600" : "text-white/70"
              }`}
            >
              {item.title}
            </p>
            <p className="text-xs text-gray-500 mt-2 text-center">Coming soon</p>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {insights.map((insight, index) => {
        const iconColor = INSIGHT_COLORS[insight.type] || "text-gray-500";
        const bgColor = INSIGHT_BG_COLORS[insight.type] || "from-gray-500/10 to-gray-500/5";
        return (
          <Card
            key={index}
            className={`p-4 rounded-xl border-0 backdrop-blur-sm transition-all duration-300 hover:shadow-lg cursor-pointer group bg-gradient-to-br ${bgColor} ${
              theme === "light"
                ? "hover:bg-opacity-80"
                : "border border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`${iconColor} mt-0.5 group-hover:scale-110 transition-transform`}>
                {INSIGHT_ICONS[insight.type]}
              </div>
              <div className="flex-1">
                <h4
                  className={`text-sm font-semibold mb-1 ${
                    theme === "light" ? "text-[#1e1a2b]" : "text-white"
                  }`}
                >
                  {insight.title}
                </h4>
                <p
                  className={`text-xs mb-3 ${
                    theme === "light" ? "text-gray-700" : "text-white/70"
                  }`}
                >
                  {insight.description}
                </p>
                <button
                  className={`text-xs font-medium transition-colors ${
                    theme === "light"
                      ? "text-[#66FF99] hover:text-[#66FF99]/80"
                      : "text-[#66FF99] hover:text-[#66FF99]/80"
                  }`}
                >
                  {insight.action} →
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
