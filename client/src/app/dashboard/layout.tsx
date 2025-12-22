"use client";

import Sidebar from "@/components/Sidebar";
import DashboardTopBar from "@/components/DashboardTopBar";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { SwitchModeProvider, useSwitchMode } from "@/components/SwitchMode";
import { safeLocalStorage } from "@/lib/safeLocalStorage";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { theme } = useSwitchMode();
  const [hasLightTheme, setHasLightTheme] = useState(false);

  // Sync theme to className only on client
  useEffect(() => {
    setHasLightTheme(theme === "light");
  }, [theme]);

  const handleLogout = () => {
    safeLocalStorage.remove("token");
    router.replace("/");
  };

  return (
    <div className={`flex min-h-screen w-full bg-background ${hasLightTheme ? 'border border-black/20 shadow-[0_4px_32px_0_rgba(0,0,0,0.10)]' : ''}` }>
      {/* Sidebar visually separated with glassmorphism and shadow */}
      <Sidebar onLogout={handleLogout} />
      {/* Main content with more padding and a soft background gradient */}
      <main className="flex-1 px-2 md:px-8 py-6 md:py-10 bg-gradient-to-br from-[#f7f6ff] via-[#e6ffe0] to-[#e6e0ff] dark:from-[#0f1f1c] dark:via-[#182e2a] dark:to-[#1e3a34] transition-colors duration-500 overflow-y-auto rounded-tl-3xl rounded-bl-3xl shadow-xl">
        <div className="flex flex-col gap-8 w-full">
          {/* Top Bar - Consistent across all dashboard pages */}
          <DashboardTopBar />
          {/* Page content */}
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SwitchModeProvider>
      <Toaster />
      <DashboardContent>{children}</DashboardContent>
    </SwitchModeProvider>
  );
}
