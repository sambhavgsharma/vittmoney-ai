"use client";
import AuthModal from "@/components/AuthModal";
import Loader from "../../components/Loader";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

// You can place a GIF in public/assets/images/building.gif
const BUILDING_GIF = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTY4N3dyZjFidjJ0MmJmZjF2aWR1bmVvN3pqb2FkdGIwN2IxNmljbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cfGmVRsJI6wq6noGxP/giphy.gif";
const LOGO = "/assets/images/logo.svg";

type User = {
  name?: string;
  username?: string;
  email?: string;
  profilePic?: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAuthModalOpen(true);
      router.replace("/");
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://vittmoney-ai-backend.onrender.com/api";
    fetch(`${apiBase}/me`, {
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
        setLoading(false);
      })
      .catch(() => {
        setAuthModalOpen(true);
        router.replace("/");
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out!");
    setTimeout(() => {
      router.replace("/");
    }, 1000);
  };

  if (authModalOpen) {
    return <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} type="login" />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1f1c] px-4">
      <Toaster />
      <Image
        src={LOGO}
        alt="Vittmoney Logo"
        width={96}
        height={96}
        className="w-24 h-24 rounded-full mb-4 border-2 border-[#66FF99] bg-white"
        priority
      />
      <h1 className="text-3xl font-extrabold mb-1 text-[#66FF99] tracking-tight">Vittmoney</h1>
      <h2 className="text-lg font-semibold mb-4 text-white/80">Welcome, {user?.name || user?.username || user?.email}</h2>
      <Image
        src={
          user?.profilePic?.startsWith('/')
            ? (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000') + user.profilePic
            : user?.profilePic || LOGO
        }
        alt="avatar"
        width={80}
        height={80}
        className="w-20 h-20 rounded-full mb-2 border border-[#66FF99] bg-white"
      />
      <p className="text-white/70 mb-4">{user?.email}</p>
      <button
        onClick={handleLogout}
        className="bg-[#66FF99] text-black px-4 py-2 rounded hover:bg-[#5ee390] transition mb-6"
      >
        Logout
      </button>
      <div className="flex flex-col items-center mt-6 bg-[#1a2e2a] rounded-xl p-6 shadow-lg max-w-md w-full">
        <Image
          src={BUILDING_GIF}
          alt="Building"
          width={128}
          height={128}
          className="w-32 h-32 object-contain mb-4"
          style={{ background: "#fff", borderRadius: "1rem" }}
        />
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#66FF99] mb-2">Vittmoney is building 🚧</h3>
          <p className="text-white/80 text-base">
            This is just the <span className="font-semibold text-[#66FF99]">pre-release</span>.<br />
            Authentication is working. Stay tuned for more features!
          </p>
        </div>
      </div>
    </div>
  );
}