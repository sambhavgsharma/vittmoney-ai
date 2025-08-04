
"use client";
import Card from "@/components/Card";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import logo from "@/assets/images/logo.svg";
import { useEffect, useState, useRef } from "react";

interface User {
  name: string;
  email: string;
  profilePic?: string;
}

export default function DashboardHome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        const res = await fetch("http://localhost:5000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          setError("Failed to fetch user");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (e) {
        setError("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Keyboard shortcut: Cmd+F (Mac) or Ctrl+F (Win/Linux) focuses search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // On Mac: metaKey (Cmd), on Windows/Linux: ctrlKey
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac && e.metaKey && e.key.toLowerCase() === "f") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "f")) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Top Card */}
      <Card className="w-full flex items-center justify-between p-2 md:p-3 rounded-[10px] bg-gradient-to-r from-[#0f1f1c] via-[#182e2a] to-[#1e3a34] border-0 shadow-xl relative overflow-hidden min-h-[48px] md:min-h-[56px] max-h-[56px]">
        {/* Subtle background blob for extra aesthetic */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#66FF99]/20 rounded-full blur-3xl z-0" />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-[#66FF99]/10 rounded-full blur-2xl z-0" />

        {/* Center: Search Bar */}
        <div className="flex justify-center z-10">
          <div className="relative flex items-center w-full max-w-[180px] md:max-w-[200px]">
            <Input
              type="text"
              placeholder="Search..."
              id="dashboard-search-bar"
              ref={searchRef}
              className="w-full px-4 py-1.5 text-sm md:text-base text-white placeholder:text-white/40 placeholder:font-extralight focus:ring-[#66FF99] focus:border-[#66FF99] shadow-sm transition-all border border-white/20 bg-white/10 font-extralight outline-none select-text"
              style={{ fontWeight: 200, borderRadius: '8px 18px 8px 18px' }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40 bg-[#1e3a34]/70 px-2 py-0.5 rounded-md select-none pointer-events-none hidden md:inline-flex items-center gap-1">
              ⌘+F
            </span>
          </div>
        </div>

        {/* Right: User Info + Buttons */}
        <div className="flex items-center gap-2 md:gap-3 z-10">
          {/* Mail Button */}
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-[#66FF99]/10 transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a3 3 0 003.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </button>
          {/* Notification Button */}
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-[#66FF99]/10 transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          {/* Avatar */}
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#66FF99] shadow-md bg-white/10 flex items-center justify-center">
            {user && user.profilePic ? (
              <img src={user.profilePic} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/50 text-lg font-bold">{user?.name?.[0] || "U"}</span>
            )}
          </div>
          {/* Name & Email */}
          <div className="flex flex-col items-start justify-center ml-1">
            <span className="text-xs md:text-sm font-semibold text-white leading-tight truncate max-w-[90px] md:max-w-[120px]">{user?.name || "User"}</span>
            <span className="text-[10px] md:text-xs text-white/50 leading-tight truncate max-w-[90px] md:max-w-[120px]">{user?.email || "user@email.com"}</span>
          </div>
        </div>
      </Card>
      {/* Main dashboard content can go here */}
      <div className="text-white text-xl font-bold">
        Welcome to your dashboard <span role="img" aria-label="wave">👋</span>
      </div>
      {error && (
        <div className="text-red-400 text-sm font-medium">{error}</div>
      )}
    </div>
  );
}