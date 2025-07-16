"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../../components/Loader";

export default function OAuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      toast.success("Logged in. Redirecting...");
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1200);
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

