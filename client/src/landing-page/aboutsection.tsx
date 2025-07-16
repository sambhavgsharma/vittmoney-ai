"use client";
import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const AboutSection = () => {
  useEffect(() => {
    // GSAP fade + slide for About section
    gsap.fromTo(
      "#about-title",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: "#about-title",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
    gsap.fromTo(
      ["#about-para-1", "#about-para-2"],
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#about-title",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return (
    <section
      id="about"
      className="relative py-32 md:py-40 bg-[#04443C] overflow-hidden"
    >
      {/* Blurred gradient blob background */}
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-[#66FF99] to-white opacity-20 blur-3xl rounded-full -z-10"></div>
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Logo / Image Side */}
        <div className="flex justify-center md:justify-start">
          <Image
            src="/assets/images/logo.svg"
            alt="Vittmoney Logo"
            width={256}
            height={256}
            className="w-64 h-64 object-contain animate-float-slow drop-shadow-[0_0_32px_#66FF99aa] hover:scale-105 transition-transform ease-in-out duration-500"
            priority
          />
        </div>
        {/* Text Side */}
        <div>
          <h2
            id="about-title"
            className="text-3xl md:text-5xl font-bold text-[#66FF99] mb-6 drop-shadow-black"
          >
            Why We Built Vittmoney
          </h2>
          <p
            id="about-para-1"
            className="text-lg md:text-xl text-white/90 mb-4"
          >
            We’re not just another tracker. Vittmoney is built for clarity —
            turning your spending chaos into actionable insights using beautiful
            data and powerful AI.
          </p>
          <p
            id="about-para-2"
            className="text-lg md:text-xl text-white/70"
          >
            Most financial tools are either too boring or too complex. We’re making
            money feel human — visual, intuitive, and even a little fun.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
