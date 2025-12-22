"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Button from "@/components/Button";
import Loader from "./Loader";
import { safeLocalStorage } from "@/lib/safeLocalStorage";

export default function AuthModal({ open, onOpenChange, type }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "login" | "register";
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalType, setModalType] = useState<"login" | "register">((type || "register") as "login" | "register");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // add confirm password state
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Keep modalType in sync with prop
  useEffect(() => {
    setModalType(type);
  }, [type]);

  // GSAP modal entrance animation
  useEffect(() => {
    if (open && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: 60, scale: 0.96, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.38, ease: "power3.out" }
      );
    }
  }, [open]);

  // Utility to generate a random username from name
  function generateUsername(name: string) {
    // Remove non-alphanumeric, lowercase, join words, add random 3 digits
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter(Boolean)
      .join("");
    const suffix = Math.floor(100 + Math.random() * 900); // 3 random digits
    return base ? `${base}${suffix}` : `user${suffix}`;
  }


  // Handle form submission for login or registration
  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://vittmoney-ai-backend.onrender.com/api";
    // Login Logic
    if (modalType === "login") {
      try {
        const res = await fetch(`${apiBase}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrUsername: email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Login failed");
          return;
        }
        if (data.token) {
          safeLocalStorage.set("token", data.token);
        }
        onOpenChange(false);
        // Optionally, reload or redirect
        window.location.href = "/dashboard";
      } catch {
        setError("Login failed");
      } finally {
        setSubmitting(false);
      }
    }
    // For Register Logic 
    else {

      // Registration: validate all required fields
      if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError("All fields are required.");
        setSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setSubmitting(false);
        return;
      }
      // Generate username from name
      const username = generateUsername(name);
      try {
        const res = await fetch(`${apiBase}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, username }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Registration failed");
          setSubmitting(false);
          return;
        }
        // Auto-login after registration
        const loginRes = await fetch(`${apiBase}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrUsername: email, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.token) {
          safeLocalStorage.set("token", loginData.token);
          onOpenChange(false);
          window.location.href = "/dashboard";
        } else {
          setError(loginData.message || "Auto-login failed");
        }
      } catch {
        setError("Registration failed");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // UI Here
  if (submitting) {
    return <Loader />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={modalRef}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md bg-[#0f1f1c] text-white border border-white/10 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-xl z-[100] overflow-y-auto scroll-smooth max-h-[100vh]"
      /* Remove invalid style prop and move custom scrollbar CSS to a <style> tag below */
>
        {/* Animated background blob */}
        <span
          className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-60 blur-3xl z-0"
          style={{
            background: 'radial-gradient(circle at 60% 40%, #66FF99 0%, #04443C 100%)',
            filter: 'blur(60px)',
            animation: 'blob-float 7s ease-in-out infinite alternate',
          }}
        />
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-xl md:text-2xl font-bold text-center">
            {modalType === "login" ? "Welcome Back" : "Create an Account"}
          </DialogTitle>
          <DialogDescription className="text-white/50 text-xs md:text-sm text-center mb-3 md:mb-4">
            {modalType === "login" ? "Log in to continue your journey." : "Let’s get you started on your financial mastery."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4 relative z-10">
          {modalType === "register" && (
            <>
              {/* Name input only */}
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2.5 md:p-3 rounded-md bg-[#111] border border-white/10 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#66FF99]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2.5 md:p-3 rounded-md bg-[#111] border border-white/10 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#66FF99]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {/* Password and Confirm Password single column for register */}
          {modalType === "register" ? (
            <>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full p-2.5 md:p-3 rounded-md bg-[#111] border border-white/10 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#66FF99] pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-[#66FF99] p-1 focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M1.75 9C2.75 5.5 5.75 3.25 9 3.25c3.25 0 6.25 2.25 7.25 5.75-1 3.5-4 5.75-7.25 5.75-3.25 0-6.25-2.25-7.25-5.75Z" stroke="#66FF99" strokeWidth="1.3"/><circle cx="9" cy="9" r="2.25" stroke="#66FF99" strokeWidth="1.3"/></svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M2.25 2.25l13.5 13.5M5.5 5.5A4.5 4.5 0 0 1 9 4.25c3.25 0 6.25 2.25 7.25 5.75-.37 1.3-1.1 2.5-2.13 3.45M12.5 12.5c-.8.5-1.7.8-2.5.8-3.25 0-6.25-2.25-7.25-5.75a8.1 8.1 0 0 1 2.7-3.6" stroke="#66FF99" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full p-2.5 md:p-3 rounded-md bg-[#111] border border-white/10 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#66FF99] pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </>
          ) : (
            // Login password field (single)
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-2.5 md:p-3 rounded-md bg-[#111] border border-white/10 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#66FF99] pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-[#66FF99] p-1 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M1.75 9C2.75 5.5 5.75 3.25 9 3.25c3.25 0 6.25 2.25 7.25 5.75-1 3.5-4 5.75-7.25 5.75-3.25 0-6.25-2.25-7.25-5.75Z" stroke="#66FF99" strokeWidth="1.3"/><circle cx="9" cy="9" r="2.25" stroke="#66FF99" strokeWidth="1.3"/></svg>
                ) : (
                  <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M2.25 2.25l13.5 13.5M5.5 5.5A4.5 4.5 0 0 1 9 4.25c3.25 0 6.25 2.25 7.25 5.75-.37 1.3-1.1 2.5-2.13 3.45M12.5 12.5c-.8.5-1.7.8-2.5.8-3.25 0-6.25-2.25-7.25-5.75a8.1 8.1 0 0 1 2.7-3.6" stroke="#66FF99" strokeWidth="1.3" strokeLinecap="round"/></svg>
                )}
              </button>
            </div>
          )}
          {error && (
            <div className="text-red-400 text-xs mb-2">{error}</div>
          )}
          <Button onClick={handleSubmit} variant="primary" className="w-full bg-[#66FF99] text-black hover:bg-[#5ee390] transition text-xs md:text-sm py-2.5 md:py-3">
            {modalType === "login" ? "Log In" : "Register"}
          </Button>
        </div>

        <div className="text-center text-white/60 text-xs md:text-sm my-2 md:my-3 relative z-10">or continue with</div>

        <div className="flex flex-col gap-2 md:gap-3 relative z-10">
          <Button
            onClick={() => {
              // Redirect to backend Google OAuth endpoint
              window.location.href = (process.env.NEXT_PUBLIC_API_BASE || "https://vittmoney-ai-backend.onrender.com/api") + "/google";
            }}
            variant="secondary"
            className="w-full hover:bg-white/10 text-xs md:text-sm py-2.5 md:py-3 flex items-center justify-center gap-2"
          >
            Continue with Google
          </Button>
          <Button
            onClick={() => {
              // Redirect to backend GitHub OAuth endpoint
              window.location.href = (process.env.NEXT_PUBLIC_API_BASE || "https://vittmoney-ai-backend.onrender.com/api") + "/github";
            }}
            variant="secondary"
            className="w-full hover:bg-white/10 text-xs md:text-sm py-2.5 md:py-3 flex items-center justify-center gap-2"
          >
            Continue with GitHub
          </Button>
        </div>

        {/* Switch between login/register links */}
        <div className="mt-4 text-center text-xs md:text-sm text-white/60 relative z-10">
          {modalType === "login" ? (
            <>
              New here?{' '}
              <button
                type="button"
                className="text-[#66FF99] hover:underline focus:outline-none"
                onClick={() => setModalType("register")}
              >
                Join Here
              </button>
            </>
          ) : (
            <>
              Already a member?{' '}
              <button
                type="button"
                className="text-[#66FF99] hover:underline focus:outline-none"
                onClick={() => setModalType("login")}
              >
                Login Here
              </button>
            </>
          )}
        </div>
        {/* Keyframes for blob animation */}
        <style>{`
          @keyframes blob-float {
            0% { transform: translateY(0) scale(1); }
            100% { transform: translateY(30px) scale(1.12); }
          }
          /* Custom Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent; 
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4);
}
        `}</style>
      </DialogContent>
    </Dialog>
  );

}
