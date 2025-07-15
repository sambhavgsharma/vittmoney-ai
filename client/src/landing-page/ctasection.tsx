"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
gsap.registerPlugin(ScrollTrigger);

const CTASection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <section
      id="ctasection"
      ref={sectionRef}
      className="relative overflow-hidden py-36 px-6 bg-[#0a1716]"
    >
      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 w-full h-full bg-grid-pattern opacity-100 pointer-events-none" />
      {/* Blurred Glow Circle */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#66FF99] opacity-10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6 drop-shadow-white text-[#66FF99]">
          Let’s Build Your Smartest Financial Future
        </h2>
        <p className="text-lg text-white/70 mb-12">
          Whether it’s a question, a big idea, or you just want to say hey — we’re here. Let’s talk.
        </p>
        <form className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
          <Input
            type="email"
            placeholder="Your email"
            className="bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-[#66FF99] focus:border-[#66FF99]"
          />
          <Textarea
            placeholder="Your message…"
            className="bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-[#66FF99] focus:border-[#66FF99] md:col-span-2 h-32"
          />
          <Button
            type="submit"
            className="w-full md:col-span-2 bg-[#66FF99] text-[#04443C] hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_#66FF99aa] font-semibold text-lg py-3"
          >
            Send ➤
          </Button>
        </form>
      </div>
    </section>
  );
};

export default CTASection;
