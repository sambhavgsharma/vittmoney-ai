"use client";
import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
gsap.registerPlugin(ScrollTrigger);

const CTASection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (formData.message.trim().length < 10) {
      toast.error("Message must be at least 10 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE;
      if (!apiBase) {
        toast.error("API configuration missing");
        return;
      }

      const response = await fetch(`${apiBase}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to send message");
        return;
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: '',
        email: '',
        message: '',
      });

      // Reset form
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
          <Input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={loading}
            className="bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-[#66FF99] focus:border-[#66FF99] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading}
            className="bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-[#66FF99] focus:border-[#66FF99] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Textarea
            name="message"
            placeholder="Your message…"
            value={formData.message}
            onChange={handleInputChange}
            disabled={loading}
            className="bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-[#66FF99] focus:border-[#66FF99] md:col-span-2 h-32 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full md:col-span-2 bg-[#66FF99] text-[#04443C] hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_#66FF99aa] font-semibold text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send ➤'}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default CTASection;
