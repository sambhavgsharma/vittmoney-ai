"use client";
import React, { useRef, useEffect, useLayoutEffect, Suspense, useState } from "react";
import { Plus_Jakarta_Sans } from 'next/font/google';
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import Button from '../components/Button';
import AuthModal from '../components/AuthModal';
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Text } from "@react-three/drei";
import * as THREE from "three";


const CoinsModel = ({ isUserInteracting }: { isUserInteracting: boolean }) => {
  const group = useRef<any>(null);
  const { scene } = useGLTF("/assets/3d-models/pile/scene.gltf");
  useFrame(() => {
    if (!isUserInteracting && group.current) {
      group.current.rotation.y += 0.003;
    }
  });
  return <primitive ref={group} object={scene} scale={2} />;
};

// Floating symbol for click interaction
const FloatingSymbol = ({ position, symbol, onFade }: { position: [number, number, number], symbol: string, onFade: () => void }) => {
  const ref = useRef<any>(null);
  const [opacity, setOpacity] = useState(1);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.y += delta * 0.5; // float up
      setOpacity((prev) => {
        const next = prev - delta * 0.5;
        if (next <= 0) {
          onFade();
        }
        return Math.max(0, next);
      });
    }
  });
  return (
    <Text
      ref={ref}
      position={position}
      fontSize={0.25}
      color={`rgba(255,255,255,${opacity})`}
      anchorX="center"
      anchorY="middle"
      outlineColor="#66FF99"
      outlineWidth={0.01}
    >
      {symbol}
    </Text>
  );
};


const HeroSection = () => {

  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [symbols, setSymbols] = useState<Array<{ id: number, position: [number, number, number], symbol: string }>>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const symbolId = useRef(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);



  // GSAP intro and parallax
  useEffect(() => {
    if (!titleRef.current || !subRef.current || !ctaRef.current) return;
    gsap.fromTo(titleRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
    gsap.fromTo(subRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.4, ease: 'power3.out' });
    gsap.fromTo(ctaRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, delay: 0.8, ease: 'back.out(1.7)' });

    // Parallax on scroll
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (titleRef.current) gsap.to(titleRef.current, { y: scrollY * 0.08, overwrite: 'auto', duration: 0.2 });
      if (subRef.current) gsap.to(subRef.current, { y: scrollY * 0.15, overwrite: 'auto', duration: 0.2 });
      if (ctaRef.current) gsap.to(ctaRef.current, { y: scrollY * 0.22, overwrite: 'auto', duration: 0.2 });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animated background blob for the word "Decoded" (performance: useLayoutEffect)
  useLayoutEffect(() => {
    const decodedBG = document.getElementById("decoded-bg");
    if (decodedBG) {
      gsap.to(decodedBG, {
        x: () => gsap.utils.random(-30, 30),
        y: () => gsap.utils.random(-20, 20),
        scale: () => gsap.utils.random(1, 1.3),
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }, []);


  const handleStart = () => {
    setIsUserInteracting(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleEnd = () => {
    timeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 1000); // Resume rotation after 1s idle
  };

  // Handle click on 3D canvas: spawn a floating symbol
  const handleCanvasClick = () => {
    // Random position in view (x: -1.2 to 1.2, y: -0.5 to 1.2, z: -0.5 to 0.5)
    const x = Math.random() * 2.4 - 1.2;
    const y = Math.random() * 1.7 - 0.5;
    const z = Math.random() * 1.0 - 0.5;
    const symbolList = ["✦", "+", "★", "✧", "✺"];
    const symbol = symbolList[Math.floor(Math.random() * symbolList.length)];
    setSymbols((prev) => [
      ...prev,
      { id: symbolId.current++, position: [x, y, z], symbol },
    ]);
  };

    function randomPos() {
      return {
        x: Math.random() * 60 - 30,
        y: Math.random() * 40 - 20,
        scale: 1 + Math.random() * 0.2,
      };
    }

  return (
    <section id="herosection" ref={sectionRef} className={`relative flex flex-col items-center justify-center min-h-[60vh] md:min-h-[75vh] lg:min-h-screen w-full overflow-x-hidden overflow-hidden ${plusJakarta.className}`}>
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [1, 1, 2], fov: 30 }} shadows onPointerDown={handleCanvasClick} style={{ cursor: 'pointer' }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {/* 3D VITT text in the background */}
          <Text
            position={[0, 1.2, -0.5]}
            fontSize={0.7}
            color="#66FF99"
            anchorX="center"
            anchorY="middle"
            outlineColor="#04443C"
            outlineWidth={0.04}
            fillOpacity={0.18}
            rotation={[-0.1, 0, 0]}
          >
            VITT
          </Text>
          <Suspense fallback={null}>
            <Environment preset="sunset" />
            <CoinsModel isUserInteracting={isUserInteracting} />
          </Suspense>
          {/* Render floating symbols */}
          {symbols.map(({ id, position, symbol }) => (
            <FloatingSymbol
              key={id}
              position={position}
              symbol={symbol}
              onFade={() => setSymbols((prev) => prev.filter((s) => s.id !== id))}
            />
          ))}
          <OrbitControls onStart={handleStart} onEnd={handleEnd} enableZoom={false} />
        </Canvas>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center pt-40 pb-24 px-8 text-center select-none">
        <div className="absolute inset-0 w-full h-full rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl -z-10 border border-white/20 px-12 py-10" />
        {/* Notification about 3D background interactivity */}
        <div className="absolute left-1/2 top-6 -translate-x-1/2 text-xs md:text-sm px-3 py-1 rounded-full bg-black/40 text-[#66FF99] border border-[#66FF99]/30 shadow backdrop-blur-sm z-20 pointer-events-none select-none animate-fade-in hidden sm:block">
          <span className="inline-flex items-center gap-1">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16" className="inline-block align-middle"><circle cx="8" cy="8" r="7" stroke="#66FF99" strokeWidth="1.5"/><path d="M8 5v3.5" stroke="#66FF99" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11" r=".7" fill="#66FF99"/></svg>
            The background is a 3D model — Use mouse to interact!
          </span>
        </div>
        <h1 ref={titleRef} className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-4 relative inline-block">
          Your Money,{' '}
          <span className="relative inline-block">
            <span
              className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#66FF99] via-white to-[#04443C] drop-shadow-[0_0_15px_#66FF99]"
              style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text' }}
            >
              Decoded
            </span>
            <span
              id="decoded-bg"
              className="pointer-events-none absolute inset-0 z-0 rounded-xl opacity-70"
              style={{
                background: 'radial-gradient(circle at center, #66FF99 0%, #ffffff 50%, #04443C 100%)',
                filter: 'blur(40px)',
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
            ></span>
          </span>
        </h1>
        <p ref={subRef} className="text-lg md:text-2xl text-white/80 max-w-xl mb-8">Vittmoney turns chaos into clarity.<br/>See what matters. Cut the noise. Grow smarter.</p>
        <div className="flex justify-center">
          <Button
            ref={ctaRef}
            variant="primary"
            className="transition duration-150 hover:bg-[#66FD88] focus:outline-none"
            onClick={() => setAuthOpen(true)}
            onMouseEnter={() => {
              if (ctaRef.current) {
                gsap.to(ctaRef.current, {
                  scale: 1.13,
                  boxShadow: '0 0 32px 0 #66FF99, 0 0 8px 2px #04443C',
                  filter: 'brightness(1.15) saturate(1.2)',
                  duration: 0.22,
                  ease: 'power2.out',
                });
              }
            }}
            onMouseLeave={() => {
              if (ctaRef.current) {
                gsap.to(ctaRef.current, {
                  scale: 1,
                  boxShadow: '0 4px 24px 0 #66FF9955',
                  filter: 'none',
                  duration: 0.28,
                  ease: 'power2.inOut',
                });
              }
            }}
          >
            Start Now
          </Button>
        </div>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} type="register" />
      </div>
    </section>
  );
};

export default HeroSection;
