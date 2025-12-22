"use client";

import { useState, useEffect, useRef } from "react";
import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { useSwitchMode } from "@/components/SwitchMode";
import { safeLocalStorage } from "@/lib/safeLocalStorage";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  profilePic?: string;
}

export default function DashboardTopBar() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useSwitchMode();

  // Close dropdown on outside click (mobile)
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setError(null);
      try {
        const token = safeLocalStorage.get("token");
        if (!token) {
          setError("Not authenticated");
          return;
        }
        const apiBase = process.env.NEXT_PUBLIC_API_BASE;
        if (!apiBase) {
          setError("API base URL not configured");
          return;
        }
        const res = await fetch(`${apiBase}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          setError(`Failed to fetch user: ${errorData.error || res.statusText}`);
          console.error('Failed to fetch user:', errorData);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch user';
        setError(errorMsg);
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  // Keyboard shortcut: Cmd+F (Mac) or Ctrl+F (Win/Linux) focuses search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac && e.metaKey && e.key.toLowerCase() === "f") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "f")) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    safeLocalStorage.remove("token");
    router.replace("/");
  };

  return (
    <Card
      className={`w-full flex items-center justify-between p-2 md:p-3 rounded-[14px] border-0 shadow-xl relative overflow-hidden min-h-[44px] md:min-h-[48px] max-h-[48px] transition-colors duration-300
      ${theme === 'light'
        ? 'bg-gradient-to-r from-[#f7f6ff] via-[#e6ffe0] to-[#e6e0ff] text-[#1e1a2b] border border-[#99FF77]/40'
        : 'bg-gradient-to-r from-[#0f1f1c] via-[#182e2a] to-[#1e3a34] text-white'}
      `}
    >
      {/* Subtle background blob for extra aesthetic */}
      <div className={`absolute -top-10 -left-10 w-40 h-40 ${theme === 'light' ? 'bg-[#99FF77]/20' : 'bg-[#66FF99]/20'} rounded-full blur-3xl z-0`} />
      <div className={`absolute -bottom-10 -right-10 w-44 h-44 ${theme === 'light' ? 'bg-[#99FF77]/10' : 'bg-[#66FF99]/10'} rounded-full blur-2xl z-0`} />

      {/*Search Bar */}
      <div className="flex justify-center z-10">
        <div className="relative flex items-center w-full max-w-[140px] md:max-w-[180px]">
          <Input
            type="text"
            placeholder="Search..."
            id="dashboard-search-bar"
            ref={searchRef}
            className={`w-full px-3 py-1 text-xs md:text-sm ${theme === 'light' ? 'text-[#1e1a2b] placeholder:text-[#1e1a2b]/40' : 'text-white placeholder:text-white/40'} placeholder:font-extralight focus:ring-[#99FF77] focus:border-[#99FF77] shadow-sm transition-all border border-white/20 bg-black/ font-extralight outline-none select-text`}
            style={{ fontWeight: 200, borderRadius: '18px 18px 18px 18px' }}
          />
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${theme === 'light' ? 'text-[#1e1a2b]/40 bg-[#e6ffe0]/70' : 'text-white/40 bg-[#1e3a34]/70'} px-2 py-0.5 rounded-md select-none pointer-events-none hidden md:inline-flex items-center gap-1`}>
            <span className="font-bold text-base">⌘</span>+F
          </span>
        </div>
      </div>

      {/* Right: User Info + Buttons */}
      <div className="flex items-center gap-2 md:gap-3 z-10">
        {/* Desktop: Mail, Notification, Theme, Avatar, Name, Email */}
        <div className="hidden md:flex items-center gap-2 md:gap-3">
          {/* Mail Button */}
          <button className={`w-8 h-8 flex items-center justify-center rounded-full border hover:bg-opacity-20 transition-all shadow-md
            ${theme === 'light' ? 'bg-[#99FF77]/10 border-[#99FF77]/40 text-[#1e1a2b] hover:bg-[#99FF77]/20' : 'bg-white/10 border-white/20 text-white/80 hover:bg-[#66FF99]/10'}`}
            aria-label="Mail"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a3 3 0 003.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </button>
          {/* Notification Button */}
          <button className={`w-8 h-8 flex items-center justify-center rounded-full border hover:bg-opacity-20 transition-all shadow-md
            ${theme === 'light' ? 'bg-[#99FF77]/10 border-[#99FF77]/40 text-[#1e1a2b] hover:bg-[#99FF77]/20' : 'bg-white/10 border-white/20 text-white/80 hover:bg-[#66FF99]/10'}`}
            aria-label="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          {/* Theme Switch Button */}
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all shadow-md focus:outline-none
              ${theme === 'light' ? 'bg-[#99FF77]/10 border-[#99FF77]/40 text-[#1e1a2b] hover:bg-[#99FF77]/20' : 'bg-white/10 border-white/20 text-white/80 hover:bg-[#66FF99]/10'}`}
            aria-label="Switch theme"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
            )}
          </button>
          {/* Avatar */}
          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 ${theme === 'light' ? 'border-[#99FF77]' : 'border-[#66FF99]'} shadow-md bg-white/10 flex items-center justify-center`}> 
            {user && user.profilePic ? (
              <img src={user.profilePic} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className={`text-lg font-bold ${theme === 'light' ? 'text-[#1e1a2b]/50' : 'text-white/50'}`}>{user?.name?.[0] || "U"}</span>
            )}
          </div>
          {/* Name & Email */}
          <div className="flex flex-col items-start justify-center ml-1">
            <span className={`text-xs md:text-sm font-semibold leading-tight truncate max-w-[90px] md:max-w-[120px] ${theme === 'light' ? 'text-[#1e1a2b]' : 'text-white'}`}>{user?.name || "User"}</span>
            <span className={`text-[10px] md:text-xs leading-tight truncate max-w-[90px] md:max-w-[120px] ${theme === 'light' ? 'text-[#1e1a2b]/50' : 'text-white/50'}`}>{user?.email || "user@email.com"}</span>
          </div>
        </div>
        {/* Mobile: Only Avatar, opens dropdown */}
        <div className="md:hidden relative">
          <button
            className={`w-9 h-9 rounded-full overflow-hidden border-2 ${theme === 'light' ? 'border-[#99FF77]' : 'border-[#66FF99]'} shadow-md bg-white/10 flex items-center justify-center`}
            aria-label="Open user menu"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            {user && user.profilePic ? (
              <img src={user.profilePic} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className={`text-lg font-bold ${theme === 'light' ? 'text-[#1e1a2b]/50' : 'text-white/50'}`}>{user?.name?.[0] || "U"}</span>
            )}
          </button>
          {/* Dropdown */}
          {dropdownOpen && (
            <div ref={dropdownRef} className={`absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e3a34] rounded-xl shadow-2xl border border-[#99FF77]/30 dark:border-[#66FF99]/20 z-50 p-3 flex flex-col gap-2 animate-fade-in`}> 
              <div className="flex flex-col gap-1 px-2 py-1 border-b border-[#99FF77]/20 dark:border-[#66FF99]/20 pb-2">
                <span className={`text-sm font-semibold ${theme === 'light' ? 'text-[#1e1a2b]' : 'text-white'}`}>{user?.name || "User"}</span>
                <span className={`text-xs ${theme === 'light' ? 'text-[#1e1a2b]/60' : 'text-white/60'}`}>{user?.email || "user@email.com"}</span>
              </div>
              <button
                className={`flex items-center justify-between px-2 py-2 rounded transition-colors ${theme === 'light' ? 'text-[#1e1a2b] hover:bg-[#99FF77]/10' : 'text-white hover:bg-[#66FF99]/10'}`}
                onClick={toggleTheme}
              >
                <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
                )}
              </button>
              <button
                className={`flex items-center gap-2 px-2 py-2 rounded transition-colors text-sm ${theme === 'light' ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-500/10'}`}
                onClick={handleLogout}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
