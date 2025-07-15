"use client";
import React, { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import Header from '../sections/Header';
import Footer from '../sections/Footer';
import HeroSection from '../landing-page/HeroSection';
import FeaturesSection from '../landing-page/features-section';
import AboutSection from '@/landing-page/aboutsection';
import CTASection from '@/landing-page/ctasection';

const Home = () => {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      syncTouch: true,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
  return (
    <>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <CTASection />
      <Footer />
    </>
  )
}

export default Home;
