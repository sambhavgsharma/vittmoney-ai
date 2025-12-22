

"use client";
import Card from "@/components/Card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSwitchMode } from "@/components/SwitchMode";
import { safeLocalStorage } from "@/lib/safeLocalStorage";

interface User {
  name: string;
  email: string;
  profilePic?: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const { theme } = useSwitchMode();

  return (
    <>
      {/* Main dashboard content */}
      <div className={`text-xl font-bold ${theme === 'light' ? 'text-[#1e1a2b]' : 'text-white'}`}>
        Welcome to your dashboard <span role="img" aria-label="wave">👋</span>
      </div>
    </>
  );
}