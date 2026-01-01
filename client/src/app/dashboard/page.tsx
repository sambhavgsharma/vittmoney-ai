

"use client";
import Card from "@/components/Card";
import AIVerdictCard from "@/components/AIVerdictCard";
import BalanceSummary from "@/components/BalanceSummary";
import QuickActions from "@/components/QuickActions";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import RecentTransactions from "@/components/RecentTransactions";
import InsightsCards from "@/components/InsightsCards";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSwitchMode } from "@/components/SwitchMode";
import { safeLocalStorage } from "@/lib/safeLocalStorage";
import { Sparkles } from "lucide-react";

interface User {
  name: string;
  email: string;
  profilePic?: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const { theme } = useSwitchMode();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = safeLocalStorage.get("token");
        if (!token) {
          router.replace("/");
          return;
        }
        const apiBase = process.env.NEXT_PUBLIC_API_BASE;
        const res = await fetch(`${apiBase}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // Silent fail
      }
    };
    fetchUser();
  }, [router]);

  return (
    <>
      {/* Hero Section with Greeting */}
      <div className="mb-10">
        <div className={`flex items-center justify-between mb-2`}>
          <div>
            <h1
              className={`text-4xl md:text-5xl font-bold mb-2 ${
                theme === "light" ? "text-[#1e1a2b]" : "text-white"
              }`}
            >
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}{" "}
              <span role="img" aria-label="wave">
                👋
              </span>
            </h1>
            <p
              className={`text-lg ${
                theme === "light" ? "text-gray-600" : "text-white/60"
              }`}
            >
              Here's your financial snapshot for today
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#66FF99]/10 to-[#66FF99]/5 border border-[#66FF99]/20">
            <Sparkles size={18} className="text-[#66FF99]" />
            <span className="text-sm font-medium text-[#66FF99]">
              AI insights ready
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Key Metrics */}
      <BalanceSummary />

      {/* Insights Grid */}
      <InsightsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - AI Verdict & Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Verdict Card */}
          <AIVerdictCard />

          {/* Recent Transactions */}
          <RecentTransactions />
        </div>

        {/* Right Column - Category Breakdown */}
        <div>
          <CategoryBreakdown />
        </div>
      </div>

      {/* Bottom CTA Section */}
      <Card
        className={`p-8 rounded-2xl border-0 backdrop-blur-xl overflow-hidden relative ${
          theme === "light"
            ? "bg-gradient-to-r from-[#66FF99]/15 to-[#04443C]/15 border border-[#66FF99]/20"
            : "bg-gradient-to-r from-[#66FF99]/10 to-[#04443C]/10 border border-[#66FF99]/20"
        }`}
      >
        <div className="relative z-10">
          <h3
            className={`text-2xl font-bold mb-3 ${
              theme === "light" ? "text-[#1e1a2b]" : "text-white"
            }`}
          >
            ✨ Want smarter insights?
          </h3>
          <p
            className={`mb-4 ${
              theme === "light" ? "text-gray-700" : "text-white/70"
            }`}
          >
            Upload more transactions or connect your bank account to get
            personalized AI recommendations tailored to your spending patterns.
          </p>
          <div className="flex gap-3">
            <button className="px-6 py-2 rounded-lg bg-[#66FF99] text-[#0f1f1c] font-semibold hover:bg-[#66FF99]/90 transition-colors">
              Upload Expenses
            </button>
            <button
              className={`px-6 py-2 rounded-lg border transition-colors ${
                theme === "light"
                  ? "border-[#1e1a2b]/30 text-[#1e1a2b] hover:bg-[#1e1a2b]/5"
                  : "border-white/20 text-white hover:bg-white/5"
              }`}
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#66FF99]/10 rounded-full -mr-20 -mt-20 blur-3xl" />
      </Card>
    </>
  );
}