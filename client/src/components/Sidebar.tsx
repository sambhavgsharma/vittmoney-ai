"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { useSwitchMode } from './SwitchMode';
import { Home, BarChart2, Settings, LogOut, X, Menu } from 'lucide-react';
import logo from '../assets/images/logo.svg';

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <Home size={20} /> },
    { name: "Analytics", href: "/dashboard/analytics", icon: <BarChart2 size={20} /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
  ];
  
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme } = useSwitchMode();

  const bgGradient = theme === 'light'
    ? 'bg-gradient-to-br from-[#f7f6ff]/80 via-[#e6ffe0]/70 to-[#99FF77]/20 backdrop-blur-xl'
    : 'bg-gradient-to-br from-[#0f1f1c]/80 via-[#1e3a34]/60 to-[#66FF99]/10 backdrop-blur-xl';
  const textColor = theme === 'light' ? 'text-[#1e1a2b]' : 'text-white';
  const borderColor = theme === 'light' ? 'border-[#99FF77]/30' : 'border-white/10';
  const shadow = 'shadow-xl';
  const rounded = 'rounded-3xl';

  const sidebarContent = (
    <>
      <div className={`text-xl font-bold px-2 py-4 flex items-center justify-between ${theme === 'light' ? 'text-[#99FF77]' : 'text-[#66FF99]'}`}>
        <span className="flex items-center gap-1 w-full">
          <span className="relative flex items-center justify-center h-10 w-10 min-w-[2.5rem]">
            <Image 
              src={logo} 
              alt="VittMoney Logo" 
              className="h-9 w-auto drop-shadow-[0_0_12px_rgba(102,255,153,0.7)]" 
              style={{ filter: theme === 'light' ? 'drop-shadow(0 0 12px #99FF77)' : 'drop-shadow(0 0 16px #66FF99)' }}
              priority
            />
          </span>
          <span className="flex flex-col justify-center min-w-0">
            <span className="tracking-tight font-semibold text-[1.1rem] leading-tight whitespace-nowrap">
              vittmoney
              <span className="text-[#66FF99] text-base ml-0.5 align-middle">.ai</span>
            </span>
          </span>
        </span>
        <button
          className="md:hidden ml-2 p-1 rounded hover:bg-[#99FF77]/10 transition"
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
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all text-sm font-medium ${
              pathname === href
                ? `${theme === 'light' ? 'bg-[#99FF77]/20 text-[#99FF77]' : 'bg-[#66FF99]/20 text-[#66FF99]'}`
                : `${theme === 'light' ? 'hover:bg-[#99FF77]/10 text-[#1e1a2b]/80' : 'hover:bg-[#66FF99]/10 text-white/80'}`
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
        className={`flex items-center gap-2 px-6 py-3 border-t transition-all ${borderColor} ${theme === 'light' ? 'hover:bg-[#99FF77]/10' : 'hover:bg-[#66FF99]/10'}`}
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded ${bgGradient} ${textColor} shadow-lg hover:bg-[#99FF77]/10 transition`}
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        style={{ display: open ? 'none' : undefined }}
      >
        <Menu size={28} />
      </button>

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex h-[90vh] my-6 ml-6 mr-4 w-40 ${bgGradient} ${textColor} flex-col ${shadow} ${rounded} ${borderColor} border border-opacity-30 ${theme === 'light' ? 'border-black/30 shadow-[0_4px_32px_0_rgba(0,0,0,0.12)]' : ''}`} style={{boxShadow: theme === 'light' ? '0 8px 32px 0 rgba(0,0,0,0.18)' : '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
        <div className="flex-1 flex flex-col">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Sidebar (Overlay + Panel) */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${open ? "visible" : "invisible pointer-events-none"}`} aria-hidden={!open}>
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        {/* Slide Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-64 ${bgGradient} ${textColor} flex flex-col shadow-lg transform transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
