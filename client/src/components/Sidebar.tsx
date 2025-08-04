"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, BarChart2, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: <Home size={20} /> },
  { name: "Analytics", href: "/dashboard/analytics", icon: <BarChart2 size={20} /> },
  { name: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
];

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Sidebar content for reuse
  const sidebarContent = (
    <>
      <div className="text-2xl font-bold text-[#66FF99] px-6 py-4 flex items-center justify-between">
        Vittmoney
        {/* Hamburger close button for mobile */}
        <button
          className="md:hidden ml-2 p-1 rounded hover:bg-[#66FF99]/10 transition"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-2">
        {navItems.map(({ name, href, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
              pathname === href
                ? "bg-[#66FF99]/20 text-[#66FF99]"
                : "hover:bg-[#66FF99]/10 text-white/80"
            }`}
            onClick={() => setOpen(false)}
          >
            {icon}
            <span>{name}</span>
          </Link>
        ))}
      </nav>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-6 py-3 border-t border-white/10 hover:bg-[#66FF99]/10 transition-all"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </>
  );

  return (
    <>
      {/* Hamburger open button (mobile only) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-[#0f1f1c]/80 text-white shadow-lg hover:bg-[#66FF99]/10 transition"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        style={{ display: open ? 'none' : undefined }}
      >
        <Menu size={28} />
      </button>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex h-[88vh] my-4 ml-4 w-36 bg-gradient-to-br from-[#0f1f1c]/80 via-[#1e3a34]/60 to-[#66FF99]/10 backdrop-blur-md text-white flex-col shadow-2xl rounded-2xl border border-white/10" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
        <div className="flex-1 flex flex-col">
          <div className="text-lg font-semibold text-[#66FF99] px-3 py-2 flex items-center justify-between">
            Vittmoney
          </div>
          <nav className="flex-1 px-2 py-1 space-y-1">
            {navItems.map(({ name, href, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-2 py-2 rounded-xl transition-all text-xs font-medium ${
                  pathname === href
                    ? "bg-[#66FF99]/20 text-[#66FF99]"
                    : "hover:bg-[#66FF99]/10 text-white/80"
                }`}
                onClick={() => setOpen(false)}
              >
                {icon}
                <span>{name}</span>
              </Link>
            ))}
          </nav>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 border-t border-white/10 hover:bg-[#66FF99]/10 transition-all text-xs mt-2"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Sidebar for mobile (slide in/out) */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          open ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        {/* Sidebar panel */}
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-[#0f1f1c] text-white flex flex-col shadow-lg transform transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
