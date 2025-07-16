import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthModal from "@/components/AuthModal";
import Loader from "../components/Loader";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAuthModalOpen(true);
      router.replace("/");
      setChecking(false);
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return <Loader />;
  if (authModalOpen) {
    return <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} type="login" />;
  }

  return <>{children}</>;
}
