"use client";

import React, { useState, useRef, useEffect } from "react";
import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSwitchMode } from "@/components/SwitchMode";
import { safeLocalStorage } from "@/lib/safeLocalStorage";
import toast from "react-hot-toast";
import { X, Upload, Loader2 } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    profilePic?: string;
  };
  onProfileUpdated: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { theme } = useSwitchMode();
  const [name, setName] = useState(user.name);
  const [profilePic, setProfilePic] = useState<string | File | undefined>(user.profilePic);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.profilePic || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user.name);
    setProfilePic(user.profilePic);
    setPreviewUrl(user.profilePic || null);
  }, [user, isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Store file for upload
    setProfilePic(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = safeLocalStorage.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);

      // Only add image if it's a new file
      if (profilePic instanceof File) {
        formData.append("profilePic", profilePic);
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE;
      const response = await fetch(`${apiBase}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      onProfileUpdated();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <Card
        className={`relative w-full max-w-md shadow-2xl border ${
          theme === "light"
            ? "bg-white/90 border-[#99FF77]/40"
            : "bg-[#0f1f1c]/90 border-[#66FF99]/20"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
            theme === "light"
              ? "hover:bg-[#99FF77]/20 text-[#1e1a2b]"
              : "hover:bg-[#66FF99]/20 text-white"
          }`}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2
            className={`text-2xl font-bold ${
              theme === "light" ? "text-[#1e1a2b]" : "text-white"
            }`}
          >
            Edit Profile
          </h2>
          <p
            className={`text-sm mt-1 ${
              theme === "light" ? "text-[#1e1a2b]/60" : "text-white/60"
            }`}
          >
            Update your profile information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="space-y-3">
            <label
              className={`text-sm font-semibold ${
                theme === "light" ? "text-[#1e1a2b]" : "text-white"
              }`}
            >
              Profile Picture
            </label>
            <div className="flex gap-4 items-start">
              {/* Avatar Preview */}
              <div
                className={`w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 flex items-center justify-center ${
                  theme === "light"
                    ? "border-[#99FF77] bg-[#99FF77]/10"
                    : "border-[#66FF99] bg-[#66FF99]/10"
                }`}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className={`text-2xl font-bold ${
                      theme === "light"
                        ? "text-[#1e1a2b]/50"
                        : "text-white/50"
                    }`}
                  >
                    {name[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Upload profile picture"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    theme === "light"
                      ? "bg-[#99FF77] text-[#1e1a2b] hover:bg-[#99FF77]/80"
                      : "bg-[#66FF99]/20 text-[#66FF99] border border-[#66FF99]/40 hover:bg-[#66FF99]/30"
                  }`}
                >
                  <Upload size={16} />
                  Change Avatar
                </button>
              </div>
            </div>
            <p
              className={`text-xs ${
                theme === "light" ? "text-[#1e1a2b]/50" : "text-white/50"
              }`}
            >
              JPG, PNG or GIF • Max 5MB
            </p>
          </div>

          {/* Name Section */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className={`text-sm font-semibold ${
                theme === "light" ? "text-[#1e1a2b]" : "text-white"
              }`}
            >
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className={`${
                theme === "light"
                  ? "bg-white/50 text-[#1e1a2b] placeholder:text-[#1e1a2b]/40 border-[#99FF77]/30 focus:border-[#99FF77]"
                  : "bg-white/5 text-white placeholder:text-white/40 border-[#66FF99]/20 focus:border-[#66FF99]"
              }`}
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className={`text-sm font-semibold ${
                theme === "light" ? "text-[#1e1a2b]" : "text-white"
              }`}
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className={`${
                theme === "light"
                  ? "bg-[#99FF77]/5 text-[#1e1a2b]/60 cursor-not-allowed"
                  : "bg-[#66FF99]/5 text-white/60 cursor-not-allowed"
              }`}
            />
            <p
              className={`text-xs ${
                theme === "light" ? "text-[#1e1a2b]/50" : "text-white/50"
              }`}
            >
              Email cannot be changed
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                theme === "light"
                  ? "bg-[#1e1a2b]/10 text-[#1e1a2b] hover:bg-[#1e1a2b]/20"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                theme === "light"
                  ? "bg-[#99FF77] text-[#1e1a2b] hover:bg-[#99FF77]/80 disabled:opacity-50"
                  : "bg-[#66FF99]/20 text-[#66FF99] border border-[#66FF99]/40 hover:bg-[#66FF99]/30 disabled:opacity-50"
              }`}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
