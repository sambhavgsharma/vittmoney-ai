"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import React from "react";
import { SwitchModeProvider } from "@/components/SwitchMode";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/");
  };

  return (
    <SwitchModeProvider>
      <Toaster />
      <div className={`flex min-h-screen w-full bg-background ${typeof window !== 'undefined' && window.localStorage.getItem('theme') === 'light' ? 'border border-black/20 shadow-[0_4px_32px_0_rgba(0,0,0,0.10)]' : ''}` }>
        {/* Sidebar visually separated with glassmorphism and shadow */}
        <Sidebar onLogout={handleLogout} />
        {/* Main content with more padding and a soft background gradient */}
        <main className="flex-1 px-2 md:px-8 py-6 md:py-10 bg-gradient-to-br from-[#f7f6ff] via-[#e6ffe0] to-[#e6e0ff] dark:from-[#0f1f1c] dark:via-[#182e2a] dark:to-[#1e3a34] transition-colors duration-500 overflow-y-auto rounded-tl-3xl rounded-bl-3xl shadow-xl">
          {children}
        </main>
      </div>
    </SwitchModeProvider>
  );
}
