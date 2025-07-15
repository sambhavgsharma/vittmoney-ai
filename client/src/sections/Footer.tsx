'use client';
import React from 'react';
import Image from 'next/image';
import logo from '../assets/images/logo.svg';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '/features' },
  { label: 'Contact', href: '/contact' },
];

const Footer = () => {
  return (
    <footer className="bg-[#0a1716] border-t border-white/10 px-6 py-10">
      <div className="container max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <Image src={logo} alt="Logo" className="h-8 w-auto" />
          <h1 className="text-lg font-medium tracking-wide text-white">
            vittmoney.<span className="text-[#66FF99]">ai</span>
          </h1>
        </div>

        {/* Center - Nav links */}
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white/60 hover:text-[#66FF99] transition-all text-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right - Copyright */}
        <div className="text-white/40 text-xs md:text-sm text-center md:text-right">
          © {new Date().getFullYear()} Vittmoney.ai — All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
