"use client";

import React, { useState } from "react";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSwitchMode } from "@/components/SwitchMode";
import { safeLocalStorage } from "@/lib/safeLocalStorage";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2, X, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

type DeleteStep = "confirm" | "verification";

export default function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
}: DeleteAccountModalProps) {
  const { theme } = useSwitchMode();
  const [step, setStep] = useState<DeleteStep>("confirm");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleRequestDelete = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const token = safeLocalStorage.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE;
      const response = await fetch(`${apiBase}/users/request-delete-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to request account deletion");
      }

      toast.success("Verification email sent! Check your inbox.");
      setStep("verification");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to request account deletion";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!verificationCode.trim()) {
      setErrorMessage("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const token = safeLocalStorage.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE;
      const response = await fetch(`${apiBase}/users/confirm-delete-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userEmail,
          verificationCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid verification code");
      }

      toast.success("Account deleted successfully");
      safeLocalStorage.remove("token");
      router.replace("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete account";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setVerificationCode("");
    setErrorMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <Card
        className={`relative w-full max-w-md shadow-2xl border ${
          theme === "light"
            ? "bg-white/90 border-red-400/40"
            : "bg-[#0f1f1c]/90 border-red-500/30"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
            theme === "light"
              ? "hover:bg-red-100 text-[#1e1a2b]"
              : "hover:bg-red-500/10 text-white"
          }`}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {step === "confirm" ? (
          <>
            {/* Header */}
            <div className="mb-6 flex items-start gap-3">
              <div
                className={`p-2 rounded-full flex-shrink-0 ${
                  theme === "light" ? "bg-red-100" : "bg-red-500/10"
                }`}
              >
                <AlertTriangle
                  size={24}
                  className={theme === "light" ? "text-red-600" : "text-red-400"}
                />
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    theme === "light" ? "text-[#1e1a2b]" : "text-white"
                  }`}
                >
                  Delete Account
                </h2>
                <p
                  className={`text-sm mt-1 ${
                    theme === "light"
                      ? "text-red-600/80"
                      : "text-red-400/80"
                  }`}
                >
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div
              className={`mb-6 p-4 rounded-lg border ${
                theme === "light"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-red-500/10 border-red-500/20 text-red-300"
              }`}
            >
              <p className="text-sm">
                Once you delete your account, all your data will be permanently removed. 
                This includes expenses, settings, and profile information. You will receive 
                a confirmation email to verify this action.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  theme === "light"
                    ? "bg-[#1e1a2b]/10 text-[#1e1a2b] hover:bg-[#1e1a2b]/20"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDelete}
                disabled={isLoading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  theme === "light"
                    ? "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    : "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 disabled:opacity-50"
                }`}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Delete My Account
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Verification Step */}
            <div className="mb-6 flex items-start gap-3">
              <div
                className={`p-2 rounded-full flex-shrink-0 ${
                  theme === "light" ? "bg-blue-100" : "bg-blue-500/10"
                }`}
              >
                <Mail
                  size={24}
                  className={theme === "light" ? "text-blue-600" : "text-blue-400"}
                />
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    theme === "light" ? "text-[#1e1a2b]" : "text-white"
                  }`}
                >
                  Verify Your Email
                </h2>
                <p
                  className={`text-sm mt-1 ${
                    theme === "light"
                      ? "text-[#1e1a2b]/60"
                      : "text-white/60"
                  }`}
                >
                  We sent a confirmation code to your email
                </p>
              </div>
            </div>

            {/* Email Info */}
            <div
              className={`mb-6 p-4 rounded-lg border ${
                theme === "light"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-blue-500/10 border-blue-500/20"
              }`}
            >
              <p
                className={`text-sm ${
                  theme === "light"
                    ? "text-blue-800"
                    : "text-blue-300"
                }`}
              >
                <strong>Email:</strong> {userEmail}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                className={`mb-4 p-3 rounded-lg border ${
                  theme === "light"
                    ? "bg-red-50 border-red-200 text-red-800 text-sm"
                    : "bg-red-500/10 border-red-500/20 text-red-300 text-sm"
                }`}
              >
                {errorMessage}
              </div>
            )}

            {/* Verification Code Input */}
            <div className="space-y-2 mb-6">
              <label
                htmlFor="code"
                className={`text-sm font-semibold ${
                  theme === "light" ? "text-[#1e1a2b]" : "text-white"
                }`}
              >
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Enter the code from your email"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  setErrorMessage("");
                }}
                className={`text-center text-lg tracking-widest ${
                  theme === "light"
                    ? "bg-white/50 text-[#1e1a2b] placeholder:text-[#1e1a2b]/40 border-blue-300 focus:border-blue-500"
                    : "bg-white/5 text-white placeholder:text-white/40 border-blue-500/30 focus:border-blue-500"
                }`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  theme === "light"
                    ? "bg-[#1e1a2b]/10 text-[#1e1a2b] hover:bg-[#1e1a2b]/20"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  theme === "light"
                    ? "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    : "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 disabled:opacity-50"
                }`}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
