"use client";
import AuthModal from "@/components/AuthModal";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAuthModalOpen(true);
      router.replace("/");
      return;
    }
    fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          setAuthModalOpen(true);
          router.replace("/");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      })
      .catch(() => {
        setAuthModalOpen(true);
        router.replace("/");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/");
  };

  if (authModalOpen) {
    return <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} type="login" />;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* ...existing dashboard content... */}
      <h1>Welcome, {user.name}</h1>
      <button onClick={handleLogout}>Logout</button>
      {/* ...existing code... */}
    </div>
  );
}