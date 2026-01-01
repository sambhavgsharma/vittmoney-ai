"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import { useSwitchMode } from "@/components/SwitchMode";
import { safeLocalStorage } from "@/lib/safeLocalStorage";
import toast from "react-hot-toast";
import EditProfileModal from "@/components/EditProfileModal";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import { Edit2, Trash2, LogOut, Lock, Bell, Eye, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  provider: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { theme } = useSwitchMode();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = safeLocalStorage.get("token");
        if (!token) {
          router.replace("/");
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_BASE;
        const response = await fetch(`${apiBase}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    safeLocalStorage.remove("token");
    toast.success("Logged out successfully");
    router.replace("/");
  };

  const handleProfileUpdated = async () => {
    // Refresh user data
    try {
      const token = safeLocalStorage.get("token");
      const apiBase = process.env.NEXT_PUBLIC_API_BASE;
      const response = await fetch(`${apiBase}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader
            className={`animate-spin mx-auto mb-4 ${
              theme === "light" ? "text-[#1e1a2b]" : "text-white"
            }`}
            size={40}
          />
          <p
            className={theme === "light" ? "text-[#1e1a2b]" : "text-white"}
          >
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1
          className={`text-4xl font-bold mb-2 ${
            theme === "light" ? "text-[#1e1a2b]" : "text-white"
          }`}
        >
          Settings
        </h1>
        <p
          className={`text-sm ${
            theme === "light" ? "text-[#1e1a2b]/60" : "text-white/60"
          }`}
        >
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card
        className={`border ${
          theme === "light"
            ? "bg-white/50 border-[#99FF77]/40"
            : "bg-white/5 border-[#66FF99]/20"
        }`}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div
              className={`w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 flex items-center justify-center ${
                theme === "light"
                  ? "border-[#99FF77] bg-[#99FF77]/10"
                  : "border-[#66FF99] bg-[#66FF99]/10"
              }`}
            >
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className={`text-4xl font-bold ${
                    theme === "light"
                      ? "text-[#1e1a2b]/50"
                      : "text-white/50"
                  }`}
                >
                  {user.name[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2
                className={`text-2xl font-bold mb-1 ${
                  theme === "light" ? "text-[#1e1a2b]" : "text-white"
                }`}
              >
                {user.name}
              </h2>
              <p
                className={`text-sm mb-3 ${
                  theme === "light"
                    ? "text-[#1e1a2b]/60"
                    : "text-white/60"
                }`}
              >
                {user.email}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    theme === "light"
                      ? "bg-[#99FF77]/20 text-[#1e1a2b] border border-[#99FF77]/40"
                      : "bg-[#66FF99]/20 text-[#66FF99] border border-[#66FF99]/40"
                  }`}
                >
                  {user.provider.charAt(0).toUpperCase() +
                    user.provider.slice(1)}{" "}
                  Account
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    theme === "light"
                      ? "bg-[#1e1a2b]/10 text-[#1e1a2b] border border-[#1e1a2b]/20"
                      : "bg-white/10 text-white border border-white/20"
                  }`}
                >
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
              theme === "light"
                ? "bg-[#99FF77] text-[#1e1a2b] hover:bg-[#99FF77]/80"
                : "bg-[#66FF99]/20 text-[#66FF99] border border-[#66FF99]/40 hover:bg-[#66FF99]/30"
            }`}
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>
      </Card>

      {/* Security Section */}
      <div>
        <h3
          className={`text-lg font-semibold mb-4 ${
            theme === "light" ? "text-[#1e1a2b]" : "text-white"
          }`}
        >
          Security & Privacy
        </h3>

        <div className="space-y-3">
          {/* Change Password Option */}
          <Card
            className={`border p-4 cursor-not-allowed opacity-60 ${
              theme === "light"
                ? "bg-white/50 border-[#1e1a2b]/20"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    theme === "light"
                      ? "bg-[#1e1a2b]/10"
                      : "bg-white/10"
                  }`}
                >
                  <Lock size={20} />
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      theme === "light" ? "text-[#1e1a2b]" : "text-white"
                    }`}
                  >
                    Change Password
                  </h4>
                  <p
                    className={`text-sm ${
                      theme === "light"
                        ? "text-[#1e1a2b]/60"
                        : "text-white/60"
                    }`}
                  >
                    Update your password regularly
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  theme === "light"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                Coming Soon
              </span>
            </div>
          </Card>

          {/* Notifications */}
          <Card
            className={`border p-4 cursor-not-allowed opacity-60 ${
              theme === "light"
                ? "bg-white/50 border-[#1e1a2b]/20"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    theme === "light"
                      ? "bg-[#1e1a2b]/10"
                      : "bg-white/10"
                  }`}
                >
                  <Bell size={20} />
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      theme === "light" ? "text-[#1e1a2b]" : "text-white"
                    }`}
                  >
                    Notification Settings
                  </h4>
                  <p
                    className={`text-sm ${
                      theme === "light"
                        ? "text-[#1e1a2b]/60"
                        : "text-white/60"
                    }`}
                  >
                    Manage how you receive notifications
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  theme === "light"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                Coming Soon
              </span>
            </div>
          </Card>

          {/* Privacy */}
          <Card
            className={`border p-4 cursor-not-allowed opacity-60 ${
              theme === "light"
                ? "bg-white/50 border-[#1e1a2b]/20"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    theme === "light"
                      ? "bg-[#1e1a2b]/10"
                      : "bg-white/10"
                  }`}
                >
                  <Eye size={20} />
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      theme === "light" ? "text-[#1e1a2b]" : "text-white"
                    }`}
                  >
                    Privacy Settings
                  </h4>
                  <p
                    className={`text-sm ${
                      theme === "light"
                        ? "text-[#1e1a2b]/60"
                        : "text-white/60"
                    }`}
                  >
                    Control what data is shared
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  theme === "light"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                Coming Soon
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Account Section */}
      <div>
        <h3
          className={`text-lg font-semibold mb-4 ${
            theme === "light" ? "text-[#1e1a2b]" : "text-white"
          }`}
        >
          Account
        </h3>

        <div className="space-y-3">
          {/* Logout */}
          <Card
            className={`border p-4 cursor-pointer transition-all hover:shadow-lg ${
              theme === "light"
                ? "bg-white/50 border-[#1e1a2b]/20 hover:border-[#1e1a2b]/40"
                : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
            onClick={handleLogout}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    theme === "light"
                      ? "bg-blue-100"
                      : "bg-blue-500/10"
                  }`}
                >
                  <LogOut
                    size={20}
                    className={theme === "light" ? "text-blue-600" : "text-blue-400"}
                  />
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      theme === "light" ? "text-[#1e1a2b]" : "text-white"
                    }`}
                  >
                    Logout
                  </h4>
                  <p
                    className={`text-sm ${
                      theme === "light"
                        ? "text-[#1e1a2b]/60"
                        : "text-white/60"
                    }`}
                  >
                    Sign out from your account
                  </p>
                </div>
              </div>
              <span
                className={`text-2xl ${
                  theme === "light" ? "text-[#1e1a2b]/30" : "text-white/30"
                }`}
              >
                →
              </span>
            </div>
          </Card>

          {/* Delete Account */}
          <Card
            className={`border p-4 cursor-pointer transition-all hover:shadow-lg ${
              theme === "light"
                ? "bg-red-50 border-red-200 hover:border-red-300"
                : "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
            }`}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    theme === "light" ? "bg-red-100" : "bg-red-500/10"
                  }`}
                >
                  <Trash2
                    size={20}
                    className={
                      theme === "light" ? "text-red-600" : "text-red-400"
                    }
                  />
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      theme === "light" ? "text-red-900" : "text-red-300"
                    }`}
                  >
                    Delete Account
                  </h4>
                  <p
                    className={`text-sm ${
                      theme === "light"
                        ? "text-red-700/70"
                        : "text-red-300/70"
                    }`}
                  >
                    Permanently delete your account and data
                  </p>
                </div>
              </div>
              <span
                className={`text-2xl ${
                  theme === "light" ? "text-red-600/30" : "text-red-400/30"
                }`}
              >
                →
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {user && (
        <>
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={user}
            onProfileUpdated={handleProfileUpdated}
          />
          <DeleteAccountModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            userEmail={user.email}
          />
        </>
      )}
    </div>
  );
}
