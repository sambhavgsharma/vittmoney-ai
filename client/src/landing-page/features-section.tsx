"use client";
import React, { useEffect, useRef } from "react";
import Card from "../components/Card";
import { Wallet, BarChart3, BrainCircuit, CalendarCheck2, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const features = [
  {
    icon: <Wallet size={36} className="text-green-400" />, title: "Smart Expense Tracking",
    text: "Manually or via CSV — log every transaction with surgical precision. Your money, your data, always in your control."
  },
  {
    icon: <BarChart3 size={36} className="text-orange-400" />, title: "Visual Data Analytics",
    text: "From category breakdowns to monthly trends, get beautiful, interactive graphs that actually make sense of your money."
  },
  {
    icon: <BrainCircuit size={36} className="text-blue-400" />, title: "AI-Powered Verdicts",
    text: "Our AI analyzes your habits and gives clear, actionable verdicts. “Cut down on food,” “Too many subscriptions,” and more."
  },
  {
    icon: <CalendarCheck2 size={36} className="text-purple-400" />, title: "Monthly Progress Reports",
    text: "Get a bird’s-eye view of how you’re doing — this month vs last, savings vs spendings, budget targets vs reality."
  },
  {
    icon: <ShieldCheck size={36} className="text-yellow-400" />, title: "Privacy-First Approach",
    text: "No ads, no shady data selling. Vittmoney is built with transparency and privacy at the core. Your data stays yours."
  },
  {
    icon: <BarChart3 size={36} className="text-pink-400" />, title: "Seamless Multi-Device Sync",
    text: "Access your finances anywhere. Vittmoney syncs securely across all your devices for a truly connected experience."
  },
];

gsap.registerPlugin(ScrollTrigger);

const FeaturesSection = () => {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#features-section",
        start: "top 80%",
      },
    });
    cardsRef.current.forEach((card) => {
      if (!card) return;
      tl.fromTo(
        card,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.3"
      );
    });
  }, []);

  return (
    <section id="features-section" className="relative py-24 bg-black/90">
      <div className="container max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              ref={el => { cardsRef.current[i] = el; }}
              className="relative flex flex-col items-start text-left min-h-[260px] p-6 bg-[#0f1f1c] border border-white/10 rounded-xl transition-all duration-300 hover:shadow-[0_0_0_1px_#66FF9970] hover:border-white/20 group"
            >
              <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-md bg-white/5 border border-white/10">
                <div className="text-[#66FF99] group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{feature.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
