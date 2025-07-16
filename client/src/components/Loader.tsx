"use client";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f1f1c]">
      <div className="w-40 h-40">
        <Lottie animationData={loadingAnimation} loop autoplay />
      </div>
    </div>
  );
}
