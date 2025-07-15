# Vittmoney AI

> **Smart Expense Tracker & Budgeting Platform (AI-Augmented)**
>
> Premium, glassmorphic, and animated web app for next-gen personal finance.

---

## ✨ Features

- **Beautiful Hero Section**: 3D animated coins, glassmorphism, shimmering gradient headline, and smooth parallax.
- **Animated Navigation**: GSAP-powered underline, smooth scroll (Lenis), sticky glass header.
- **Features Section**: Responsive, left-aligned cards with glassmorphism, gradient icons, hover pulse, and soft glow.
- **About Section**: Brand manifesto layout, floating logo, blurred gradient blob, scroll-triggered text reveal.
- **CTA Section**: Dark glassmorphic form, SVG grid background, glowing blur, shadcn/ui form fields, GSAP fade-in.
- **Fully Responsive**: Mobile, tablet, and desktop optimized layouts.
- **Modern Typography**: Plus Jakarta Sans via next/font.
- **Premium Animations**: GSAP, ScrollTrigger, and custom hover effects throughout.
- **3D Model Integration**: @react-three/fiber, drei, and three.js for interactive visuals.
- **Dark Mode Ready**: Subtle color contrasts and glass effects for both light and dark themes.

---

## 🛠️ Tech Stack

- **Next.js (App Router, TypeScript)**
- **Tailwind CSS**
- **GSAP & ScrollTrigger**
- **Lenis (Smooth Scroll)**
- **@react-three/fiber, drei, three.js**
- **shadcn/ui**
- **lucide-react (icons)**
- **Plus Jakarta Sans (next/font)**

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
2. **Generate shadcn/ui components (if not present):**
   ```bash
   npx shadcn-ui@latest add input textarea button
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## 📁 Project Structure

```
client/
  src/
    app/
      page.tsx           # Main entry, global Lenis smooth scroll
    components/
      Button.tsx         # Custom/animated button
      Card.tsx           # Glassmorphic feature card
      ui/                # shadcn/ui components (input, textarea, button)
    landing-page/
      HeroSection.tsx    # 3D hero, glass, animated headline
      features-section.tsx # Features cards, glass, gradient, animation
      aboutsection.tsx   # Brand story, floating logo, scroll reveal
      ctasection.tsx     # Contact form, grid bg, glass, GSAP
    sections/
      Header.tsx         # Animated nav, sticky glass
      Footer.tsx         # Footer
    utils/
      cn.ts              # Class name utility
  public/
    assets/
      3d-models/
        pile/scene.gltf  # 3D coins model
      images/
        logo.svg         # Logo
```

---

## 🧠 Design Philosophy

- **Premium Feel**: Glassmorphism, gradients, and micro-animations for a modern, award-worthy look.
- **Clarity First**: Data and UI designed for maximum clarity and usability.
- **Performance**: Animations optimized with GSAP/useLayoutEffect, smooth scroll via Lenis.
- **Accessibility**: Responsive, readable, and keyboard-friendly.

---

## 🤝 Contributing

Pull requests and suggestions are welcome! For major changes, please open an issue first.

---

## 📄 License

[MIT](./LICENSE)
