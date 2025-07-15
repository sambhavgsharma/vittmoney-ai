"use client";
import React, { useRef, useEffect } from 'react'
import gsap from 'gsap';
import logo from '../assets/images/logo.svg';
import Image from 'next/image';

import Button from '../components/Button';
import AuthModal from '@/components/AuthModal';


const navLinks = [
    { label: "Home", href: "#herosection", target: "herosection" },
    { label: "Features", href: "#features-section", target: "features-section" },
    { label: "About", href: "#about", target: "about" },
    { label: "Contact", href: "#ctasection", target: "ctasection" }
];

import Lenis from '@studio-freight/lenis';



const Header = () => {
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authType, setAuthType] = React.useState<'login' | 'register'>('login');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Animate menu open/close
  useEffect(() => {
    if (!menuRef.current || !overlayRef.current) return;
    if (menuOpen) {
      gsap.to(overlayRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.25, ease: 'power2.out' });
      gsap.to(menuRef.current, { x: 0, opacity: 1, duration: 0.32, ease: 'power3.out' });
    } else {
      gsap.to(menuRef.current, { x: '100%', opacity: 0, duration: 0.28, ease: 'power2.in' });
      gsap.to(overlayRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.22, ease: 'power2.in' });
    }
  }, [menuOpen]);

  // Close on nav click or overlay click
  const handleNavClick = (targetId: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        const lenis = (window as any).lenis;
        if (lenis && typeof lenis.scrollTo === 'function') {
          lenis.scrollTo(target, { offset: -80, duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 250);
  };

  return (
    <section className='py-4 lg:py-8 sticky top-0 z-50 bg-black/80 backdrop-blur-md'>
      <div className="container max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 border border-white/15 rounded-full p-2 px-4 items-center">
          <div className='flex items-center gap-1'>
            <Image src={logo} alt="VittMoney Logo" className='h-9 w-auto' />
            <h1 className='text-xl'>vittmoney.<span className='text-[#66FF99]'>ai</span></h1>
          </div>
          {/* Desktop Nav */}
          <nav className='hidden lg:flex justify-center items-center gap-6'>
            {navLinks.map((link, idx) => (
              <div
                key={link.label}
                className="relative group"
                style={{ display: 'inline-block' }}>
                <a
                  href={link.href}
                  className='text-sm transition duration-200 hover:text-md px-1 cursor-pointer'
                  onClick={e => {
                    e.preventDefault();
                    const target = document.getElementById(link.target);
                    if (target) {
                      const lenis = (window as any).lenis;
                      if (lenis && typeof lenis.scrollTo === 'function') {
                        lenis.scrollTo(target, { offset: -80, duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
                      } else {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }
                  }}
                  onMouseEnter={e => {
                    const underline = e.currentTarget.nextElementSibling;
                    gsap.to(underline, {
                      width: '100%',
                      left: '0%',
                      right: '0%',
                      duration: 0.12,
                      ease: 'power1.inOut'
                    });
                  }}
                  onMouseLeave={e => {
                    const underline = e.currentTarget.nextElementSibling;
                    gsap.to(underline, {
                      width: '0%',
                      left: '50%',
                      right: '50%',
                      duration: 0.12,
                      ease: 'power1.inOut'
                    });
                  }}
                >
                  {link.label}
                </a>
                <span
                  className="block h-[2px] rounded-full bg-[#66FF99] absolute bottom-[-6px]"
                  style={{ width: '0%', left: '50%', right: '50%', transition: 'width 0.12s, left 0.12s, right 0.12s' }}
                ></span>
              </div>
            ))}
          </nav>
          {/* Hamburger & Mobile Nav */}
          <div className='flex justify-end'>
            {/* Hamburger Icon */}
            <button
              className="lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#66FF99]"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className='hidden md:inline-flex items-center gap-1'>
              <Button
                variant='secondary'
                className='hover:scale-105 transition duration-150'
                onClick={() => { setAuthType('login'); setAuthOpen(true); }}
              >
                Log In
              </Button>
              <Button
                variant='primary'
                className='hover:scale-105 transition duration-150 hover:bg-[#66FD88] ml-2'
                onClick={() => { setAuthType('register'); setAuthOpen(true); }}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] opacity-0 pointer-events-none transition-opacity duration-200 lg:hidden"
        onClick={() => setMenuOpen(false)}
      />
      {/* Mobile Slide Menu */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-full w-4/5 max-w-xs bg-[#0a1716] z-[100] shadow-2xl px-8 py-12 flex flex-col gap-8 opacity-0 translate-x-full lg:hidden"
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#66FF99]"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <nav className="flex flex-col gap-6 mt-8">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-lg font-semibold text-white/90 hover:text-[#66FF99] transition-colors duration-200"
              onClick={e => {
                e.preventDefault();
                handleNavClick(link.target);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-3 mt-8">
          <Button
            variant='secondary'
            className='w-full'
            onClick={() => { setAuthType('login'); setAuthOpen(true); setMenuOpen(false); }}
          >
            Log In
          </Button>
          <Button
            variant='primary'
            className='w-full'
            onClick={() => { setAuthType('register'); setAuthOpen(true); setMenuOpen(false); }}
          >
            Register
          </Button>
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} type={authType} />
    </section>
  );
}

export default Header;
