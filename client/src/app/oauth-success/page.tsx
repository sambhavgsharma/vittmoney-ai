"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../../components/Loader";
import { safeLocalStorage } from "@/lib/safeLocalStorage";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      safeLocalStorage.set("token", token);
      // Show toast and get the toast ID
      toastIdRef.current = toast.success("Logged in. Redirecting...");
      
      // Redirect after 1 second
      const timeout = setTimeout(() => {
        // Dismiss the toast before redirecting
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
        }
        router.replace("/dashboard");
      }, 1000);
      
      return () => clearTimeout(timeout);
    } else {
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Toaster />
      <div className="flex flex-col items-center gap-2">
        <span className="text-white text-lg">Logging you in...</span>
        <Loader />
      </div>
    </div>
  );
}

