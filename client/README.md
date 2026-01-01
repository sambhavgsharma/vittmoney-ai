# Vittmoney AI - Frontend Client

> **Premium, AI-Powered Expense Tracker UI**
>
> Beautiful Next.js frontend with glassmorphism design, smooth animations, and interactive AI-powered financial insights.

---

## ✨ Features

### Design & UX
- **Glassmorphism Design**: Modern frosted glass effects with gradient backgrounds
- **Smooth Animations**: GSAP-powered transitions, scroll triggers, and interactive effects
- **Responsive Layout**: Fully optimized for mobile, tablet, and desktop devices
- **Dark Mode**: Seamless theme switching with Tailwind CSS
- **3D Elements**: React Three Fiber for interactive 3D visualizations

### Core Functionality
- **Landing Page**: Hero section with 3D animated coins, features showcase, and CTA
- **Dashboard**: Main application interface for expense tracking
- **Authentication**: GitHub and Google OAuth integration via NextAuth.js
- **AI Analysis**: Beautiful verdict card showing AI-powered spending insights
- **Real-time Updates**: Live data sync with backend API

### Technical Excellence
- **TypeScript**: Full type safety across the application
- **Server Components**: Next.js App Router with server/client boundaries
- **Optimized Performance**: Image optimization, code splitting, turbopack
- **Accessible**: WCAG-compliant components and navigation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:3001`
- Google/GitHub OAuth credentials (optional, for authentication)

### Installation

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Setup

Create `.env.local` in the client directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# OAuth Configuration (for authentication)
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth Configuration
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Running the Application

**Development Mode** (with Turbopack):
```bash
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) in your browser
- Page auto-refreshes on file changes
- Hot module reloading enabled

**Production Build**:
```bash
npm run build
npm start
```

**Linting**:
```bash
npm run lint
```

---

## 📁 Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with Lenis smooth scroll
│   │   ├── page.tsx                # Landing page
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Dashboard main page
│   │   │   └── layout.tsx          # Dashboard layout
│   │   └── api/                    # API routes
│   │
│   ├── components/
│   │   ├── AIVerdictCard.tsx       # AI insight display component
│   │   ├── Button.tsx              # Custom button component
│   │   ├── Card.tsx                # Glassmorphic card component
│   │   └── ui/                     # shadcn/ui components
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       └── button.tsx
│   │
│   ├── landing-page/
│   │   ├── HeroSection.tsx         # 3D hero with animated coins
│   │   ├── features-section.tsx    # Feature cards showcase
│   │   ├── about-section.tsx       # Brand story & values
│   │   └── cta-section.tsx         # Contact form section
│   │
│   ├── sections/
│   │   ├── Header.tsx              # Navigation header
│   │   └── Footer.tsx              # Footer
│   │
│   ├── utils/
│   │   ├── cn.ts                   # Class name utility
│   │   └── api.ts                  # API helper functions
│   │
│   └── globals.d.ts                # Global type definitions
│
├── public/
│   ├── assets/
│   │   ├── 3d-models/
│   │   │   └── pile/scene.gltf     # 3D coins model
│   │   └── images/
│   │       └── logo.svg
│   │
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── package.json                    # Dependencies and scripts
└── README.md                        # This file
```

---

## 🎨 Design System

### Colors & Themes
- **Primary Gradient**: From blue to purple
- **Glass Effect**: Semi-transparent backgrounds with backdrop blur
- **Dark Mode**: Optimized for eye comfort with proper contrast ratios
- **Accent Colors**: Vibrant gradients for highlights and CTAs

### Typography
- **Font Family**: Plus Jakarta Sans (via next/font)
- **Headings**: Bold, large sizes with gradient text
- **Body**: Clean, readable sans-serif with proper line heights

### Components
- **Card**: Glassmorphic container with hover effects
- **Button**: Interactive with smooth transitions and gradients
- **Input**: Form fields with focus states and validation
- **Modal**: Dialog components from Radix UI

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Static typing and better DX |
| **Tailwind CSS** | Utility-first CSS framework |
| **GSAP** | Advanced animations and interactions |
| **ScrollTrigger** | Scroll-based animations |
| **Lenis** | Smooth scroll library |
| **React Three Fiber** | 3D graphics in React |
| **Drei** | 3D utilities for Three.js |
| **shadcn/ui** | Accessible component library |
| **Radix UI** | Headless UI primitives |
| **Lucide React** | Icon library |
| **NextAuth.js** | Authentication for Next.js |
| **GraphQL Request** | GraphQL client |

---

## 🎯 Key Components

### AIVerdictCard
Displays AI-generated spending insights with loading states and error handling.

```tsx
<AIVerdictCard
  question="How can I save more on food?"
  verdict="Based on your spending..."
  loading={false}
/>
```

### HeroSection
3D animated hero with glassmorphic design and smooth parallax effects.

Features:
- Animated 3D coins model
- Gradient headline with shimmering effect
- Parallax scrolling
- Responsive layout

### Dashboard
Main application interface showing:
- Expense list and filters
- Summary statistics
- AI analysis card
- Budget tracking

---

## 🔄 State Management

The application uses:
- **React Context**: For global state (theme, auth)
- **Custom Hooks**: For local component state
- **Server Components**: For server-side data fetching

---

## 🔐 Authentication Flow

1. User clicks "Sign In" button
2. Redirected to OAuth provider (GitHub/Google)
3. User authorizes the application
4. Backend exchanges code for tokens
5. Session created and stored
6. User redirected to dashboard

Providers supported:
- GitHub OAuth
- Google OAuth

---

## 📱 Responsive Design

Breakpoints:
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

All components are optimized for each breakpoint with proper spacing and layout adjustments.

---

## 🚀 Performance Optimizations

- **Image Optimization**: Next.js Image component with automatic optimization
- **Code Splitting**: Route-based and component-based splitting
- **Turbopack**: Lightning-fast bundling in development
- **CSS Optimization**: Tailwind purging unused styles
- **Font Optimization**: next/font with automatic font optimization

---

## 🧪 Development Tips

### Hot Reload
Changes to `.tsx` files automatically reload the page without losing state.

### Debugging
Use browser DevTools or VS Code debugger:
```json
{
  "name": "Next.js",
  "type": "node",
  "request": "attach",
  "port": 9229
}
```

### Console Logging
```tsx
console.log('Debug info:', variable);
```

### Performance Analysis
```bash
npm run build
npm start
# Check "Next.js Production" in browser DevTools
```

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [GSAP Documentation](https://gsap.com/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📝 Best Practices

1. **Component Structure**: Keep components small and focused
2. **Type Safety**: Always use proper TypeScript types
3. **Accessibility**: Use semantic HTML and ARIA labels
4. **Performance**: Use React.memo for expensive components
5. **Code Style**: Follow eslint rules and prettier formatting

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

### Build Failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Type Errors
```bash
# Rebuild TypeScript
npx tsc --noEmit
```

---

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t vittmoney-client .
docker run -p 3000:3000 vittmoney-client
```

### Manual
```bash
npm run build
npm start
```

---

## 🤝 Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Test changes before pushing
4. Update documentation as needed

---

**Made with ❤️ using Next.js and Tailwind CSS**
