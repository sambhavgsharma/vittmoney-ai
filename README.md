# Vittmoney AI - Smart Expense Tracker & Budgeting Platform# Vittmoney AI



> **AI-Augmented Personal Finance Management**> **Smart Expense Tracker & Budgeting Platform (AI-Augmented)**

>>

> A full-stack application combining a beautiful Next.js frontend, Node.js/Express backend, and Python ML service to provide intelligent financial insights powered by Google Gemini AI.> Premium, glassmorphic, and animated web app for next-gen personal finance.



------



## 📋 Project Overview## ✨ Features



Vittmoney AI is a premium personal finance application that helps users track expenses and receive AI-powered financial insights. The platform features:- **Beautiful Hero Section**: 3D animated coins, glassmorphism, shimmering gradient headline, and smooth parallax.

- **Animated Navigation**: GSAP-powered underline, smooth scroll (Lenis), sticky glass header.

- **Beautiful UI**: Modern glassmorphism design with smooth animations- **Features Section**: Responsive, left-aligned cards with glassmorphism, gradient icons, hover pulse, and soft glow.

- **AI-Powered Insights**: Get intelligent spending analysis using RAG (Retrieval-Augmented Generation)- **About Section**: Brand manifesto layout, floating logo, blurred gradient blob, scroll-triggered text reveal.

- **Multi-Service Architecture**: Frontend, Backend API, and ML Service- **CTA Section**: Dark glassmorphic form, SVG grid background, glowing blur, shadcn/ui form fields, GSAP fade-in.

- **Real-time Data Processing**: Fast embedding generation and semantic search- **Fully Responsive**: Mobile, tablet, and desktop optimized layouts.

- **Secure Authentication**: GitHub and Google OAuth integration- **Modern Typography**: Plus Jakarta Sans via next/font.

- **Premium Animations**: GSAP, ScrollTrigger, and custom hover effects throughout.

---- **3D Model Integration**: @react-three/fiber, drei, and three.js for interactive visuals.

- **Dark Mode Ready**: Subtle color contrasts and glass effects for both light and dark themes.

## 🏗️ Architecture Overview

---

```

┌─────────────────────────────────────────────────────────────┐## 🛠️ Tech Stack

│                    Client (Next.js)                         │

│  - Beautiful UI with glassmorphism design                   │- **Next.js (App Router, TypeScript)**

│  - Dashboard with expense tracking                          │- **Tailwind CSS**

│  - AI analysis interface                                    │- **GSAP & ScrollTrigger**

└────────────────────┬────────────────────────────────────────┘- **Lenis (Smooth Scroll)**

                     │ HTTP/REST- **@react-three/fiber, drei, three.js**

┌────────────────────▼────────────────────────────────────────┐- **shadcn/ui**

│              Server (Node.js/Express)                       │- **lucide-react (icons)**

│  - Express API routes                                       │- **Plus Jakarta Sans (next/font)**

│  - MongoDB for data storage                                 │

│  - JWT authentication                                       │---

│  - LLM integration (Google Gemini)                           │

│  - Knowledge base management                                │## 🚀 Getting Started

└────────────────────┬────────────────────────────────────────┘

                     │ HTTP/REST1. **Install dependencies:**

┌────────────────────▼────────────────────────────────────────┐   ```bash

│         ML Service (Python/FastAPI)                         │   npm install

│  - Text embedding generation                                │   # or

│  - Sentence Transformers model                              │   yarn install

│  - Vector operations                                        │   ```

└─────────────────────────────────────────────────────────────┘2. **Generate shadcn/ui components (if not present):**

```   ```bash

   npx shadcn-ui@latest add input textarea button

---   ```

3. **Run the development server:**

## 🚀 Quick Start   ```bash

   npm run dev

### Prerequisites   # or

- Node.js 18+   yarn dev

- Python 3.8+   ```

- MongoDB4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

- Google Gemini API Key

- GitHub/Google OAuth credentials (optional)---



### 1. Clone and Install Dependencies## 📁 Project Structure



```bash```

# Root directoryclient/

git clone <repository-url>  src/

cd vittmoney-ai    app/

      page.tsx           # Main entry, global Lenis smooth scroll

# Install client dependencies    components/

cd client      Button.tsx         # Custom/animated button

npm install      Card.tsx           # Glassmorphic feature card

      ui/                # shadcn/ui components (input, textarea, button)

# Install server dependencies    landing-page/

cd ../server      HeroSection.tsx    # 3D hero, glass, animated headline

npm install      features-section.tsx # Features cards, glass, gradient, animation

      aboutsection.tsx   # Brand story, floating logo, scroll reveal

# Install ML service dependencies      ctasection.tsx     # Contact form, grid bg, glass, GSAP

cd ../ml    sections/

python -m venv venv      Header.tsx         # Animated nav, sticky glass

source venv/bin/activate  # On Windows: venv\Scripts\activate      Footer.tsx         # Footer

pip install -r requirements.txt    utils/

```      cn.ts              # Class name utility

  public/

### 2. Environment Setup    assets/

      3d-models/

**Server** (`server/.env`):        pile/scene.gltf  # 3D coins model

```env      images/

MONGODB_URI=mongodb://localhost:27017/vittmoney        logo.svg         # Logo

JWT_SECRET=your-secret-key```

GOOGLE_GEMINI_API_KEY=your-google-gemini-key

GITHUB_CLIENT_ID=your-github-id---

GITHUB_CLIENT_SECRET=your-github-secret

GOOGLE_CLIENT_ID=your-google-id## 🧠 Design Philosophy

GOOGLE_CLIENT_SECRET=your-google-secret

ML_SERVICE_URL=http://localhost:5000- **Premium Feel**: Glassmorphism, gradients, and micro-animations for a modern, award-worthy look.

```- **Clarity First**: Data and UI designed for maximum clarity and usability.

- **Performance**: Animations optimized with GSAP/useLayoutEffect, smooth scroll via Lenis.

**Client** (`client/.env.local`):- **Accessibility**: Responsive, readable, and keyboard-friendly.

```env

NEXT_PUBLIC_API_URL=http://localhost:3001---

GITHUB_ID=your-github-id

GITHUB_SECRET=your-github-secret## 🤝 Contributing

GOOGLE_CLIENT_ID=your-google-id

GOOGLE_CLIENT_SECRET=your-google-secretPull requests and suggestions are welcome! For major changes, please open an issue first.

```

---

### 3. Start Services

## 📄 License

**Terminal 1 - ML Service** (Python):

```bash[MIT](./LICENSE)

cd ml
source venv/bin/activate
python app.py
# Runs on http://localhost:5000
```

**Terminal 2 - Backend Server** (Node.js):
```bash
cd server
npm run dev
# Runs on http://localhost:3001
```

**Terminal 3 - Frontend Client** (Next.js):
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

---

## 📁 Project Structure

```
vittmoney-ai/
├── client/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/              # App router, layouts, pages
│   │   ├── components/       # React components
│   │   ├── landing-page/     # Landing page sections
│   │   ├── sections/         # Reusable sections
│   │   └── utils/            # Utilities and helpers
│   ├── public/               # Static assets
│   └── package.json
│
├── server/                    # Node.js/Express Backend
│   ├── auth/                 # OAuth strategies
│   ├── middleware/           # Express middleware
│   ├── routes/               # API routes
│   ├── services/             # Business logic services
│   ├── jobs/                 # Batch jobs (knowledge base building)
│   ├── knowledgebase/        # User knowledge bases
│   ├── Models/               # MongoDB schemas
│   ├── index.js              # Express app entry
│   └── package.json
│
└── ml/                        # Python ML Service
    ├── app.py                # FastAPI application
    ├── embeddings.py         # Embedding utilities
    ├── model.py              # ML model wrapper
    ├── vector_store.py       # Vector operations
    ├── requirements.txt      # Python dependencies
    └── venv/                 # Virtual environment
```

---

## 🔑 Key Features

### Frontend (Client)
- **Beautiful UI Design**: Glassmorphism, smooth animations with GSAP
- **Responsive Layout**: Mobile, tablet, and desktop optimized
- **Dark Mode Support**: Theme switching with Tailwind CSS
- **Real-time Dashboard**: Expense tracking and visualization
- **AI Analysis Interface**: Interactive verdict card for spending insights

### Backend (Server)
- **RESTful API**: Express.js with structured routing
- **Authentication**: JWT + OAuth (GitHub, Google)
- **Data Management**: MongoDB for expenses, users, and metadata
- **Knowledge Base Building**: Scheduled job to create user-specific knowledge bases
- **AI Integration**: Google Gemini API for intelligent insights
- **ML Service Integration**: Calls Python ML service for embeddings

### ML Service (Python)
- **Text Embeddings**: Sentence Transformers for semantic understanding
- **Fast Inference**: CPU-optimized for quick embedding generation
- **Health Checks**: Built-in monitoring and status endpoints
- **Easy Integration**: Simple HTTP API for embedding requests

---

## 🧠 AI Features

### How It Works

1. **Knowledge Base Building** (`buildKnowledgebase.js`)
   - Fetches user's expense data from MongoDB
   - Converts expenses to natural language facts: "₹420 spent on Food at Zomato"
   - Sends facts to ML service for embedding generation
   - Stores knowledge base per user for fast retrieval

2. **Query Processing** (`POST /api/ai/verdict`)
   - User asks a question about their spending
   - Question is embedded using ML service
   - Semantic similarity search finds top-5 relevant facts
   - Retrieved facts + question sent to Gemini API
   - LLM generates insights based on user's actual data

3. **Response Generation**
   - AI verdict with specific, actionable insights
   - No speculation beyond available data
   - Maximum 3 recommendations per query

### Example Flow
```
User Query: "How can I reduce food expenses?"
    ↓
Embed query → Search knowledge base
    ↓
Find relevant facts:
  - "₹420 spent on Food at Zomato"
  - "₹650 spent on Food at Swiggy"
  - "₹300 spent on Food at local restaurant"
    ↓
Gemini generates verdict:
  "Based on your data, you spent ₹1,370 on food this week.
   Consider cooking at home 2-3x weekly to save ~₹40% per week."
```

---

## 🛠️ Tech Stack

### Client
- **Framework**: Next.js 16 (TypeScript)
- **Styling**: Tailwind CSS, PostCSS
- **Animations**: GSAP, ScrollTrigger, Lenis
- **3D Graphics**: React Three Fiber, Drei
- **UI Components**: shadcn/ui, Radix UI
- **Authentication**: NextAuth.js
- **GraphQL**: graphql-request

### Server
- **Runtime**: Node.js
- **Framework**: Express 5.x
- **Database**: MongoDB
- **Authentication**: JWT, Passport.js (GitHub, Google)
- **AI**: Google Generative AI (Gemini 1.5 Flash)
- **File Upload**: Multer
- **Email**: Nodemailer
- **Password Hashing**: bcryptjs

### ML Service
- **Framework**: Python 3.8+
- **API**: FastAPI
- **Embeddings**: Sentence Transformers (all-MiniLM-L6-v2)
- **Vector Ops**: NumPy, scikit-learn

---

## 📦 Deployment

### Docker Support
Both server and client include Dockerfiles for containerized deployment.

```bash
# Build and run with docker-compose
docker-compose up -d
```

### Environment Variables
Each service requires specific environment variables. See the `.env.example` files in each directory for required configurations.

---

## 🔄 Development Workflow

### Running Tests
```bash
# Client
cd client && npm run lint

# Server
cd server && npm test
```

### Building for Production
```bash
# Client
cd client && npm run build && npm start

# Server
cd server && npm start

# ML Service
cd ml && gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 📚 Detailed Service Documentation

Each service has its own detailed README:
- [Client Documentation](./client/README.md)
- [Server Documentation](./server/README.md)
- [ML Service Documentation](./ml/README.md)

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 📧 Support

For issues and questions, please open an issue on the GitHub repository.

---

**Built with ❤️ using modern web technologies**
