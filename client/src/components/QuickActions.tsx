"use client";

import { useSwitchMode } from "@/components/SwitchMode";
import Card from "@/components/Card";
import { Plus, Upload, TrendingUp, FileText } from "lucide-react";
import Link from "next/link";
import Button from "@/components/Button";

export default function QuickActions() {
  const { theme } = useSwitchMode();

  const actions = [
    {
      icon: Plus,
      label: "Add Expense",
      description: "Log a new expense",
      href: "/dashboard/expenses",
      color: "from-blue-500 to-cyan-500",
      lightColor: "from-blue-400 to-cyan-400",
    },
    {
      icon: Upload,
      label: "Import CSV",
      description: "Bulk upload expenses",
      href: "/dashboard/expenses",
      color: "from-purple-500 to-pink-500",
      lightColor: "from-purple-400 to-pink-400",
    },
    {
      icon: TrendingUp,
      label: "View Analytics",
      description: "See detailed reports",
      href: "/dashboard/analytics",
      color: "from-green-500 to-emerald-500",
      lightColor: "from-green-400 to-emerald-400",
    },
    {
      icon: FileText,
      label: "Monthly Report",
      description: "Generate report",
      href: "/dashboard/analytics",
      color: "from-orange-500 to-red-500",
      lightColor: "from-orange-400 to-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {actions.map((action) => {
        const Icon = action.icon;
        const gradientColor =
          theme === "light" ? action.lightColor : action.color;
        return (
          <Link key={action.label} href={action.href}>
            <Card
              className={`p-4 rounded-xl border-0 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                theme === "light"
                  ? "bg-white/60 hover:bg-white/80 border border-white/40"
                  : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradientColor} p-2.5 mb-3 flex items-center justify-center`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h4
                className={`text-sm font-semibold mb-1 ${
                  theme === "light" ? "text-[#1e1a2b]" : "text-white"
                }`}
              >
                {action.label}
              </h4>
              <p
                className={`text-xs ${
                  theme === "light" ? "text-gray-600" : "text-white/50"
                }`}
              >
                {action.description}
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
