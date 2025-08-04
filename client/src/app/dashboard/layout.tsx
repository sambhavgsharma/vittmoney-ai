"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/");
  };

  return (
    <div className="flex h-screen bg-[#0f1f1c]">
      <Toaster />
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
