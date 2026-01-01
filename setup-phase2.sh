#!/bin/bash
# 🚀 VittMoney Phase 2 — Quick Setup & Verification

set -e  # Exit on error

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🚀 VittMoney Phase 2 Setup${NC}"
echo -e "${BLUE}================================${NC}"

# Check prerequisites
echo -e "\n${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python 3${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js${NC}"

# Setup ML Service
echo -e "\n${YELLOW}🔧 Setting up ML Service...${NC}"
cd ml

if [ ! -d "venv" ]; then
    echo -e "  Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

if [ -f "requirements.txt" ]; then
    echo -e "  Installing Python dependencies..."
    pip install -q -r requirements.txt
    echo -e "${GREEN}✅ ML Service dependencies installed${NC}"
else
    echo -e "${RED}❌ requirements.txt not found${NC}"
    exit 1
fi

cd ..

# Setup Backend
echo -e "\n${YELLOW}🔧 Setting up Backend...${NC}"
cd server

if [ ! -d "node_modules" ]; then
    echo -e "  Installing Node dependencies..."
    npm install -q
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

# Check .env
if [ ! -f ".env" ]; then
    echo -e "${RED}⚠️  .env file not found${NC}"
    echo -e "   Creating from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}   ⚠️  Please update .env with your configuration!${NC}"
fi

cd ..

# Setup Client
echo -e "\n${YELLOW}🔧 Setting up Client...${NC}"
cd client

if [ ! -d "node_modules" ]; then
    echo -e "  Installing Client dependencies..."
    npm install -q
    echo -e "${GREEN}✅ Client dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Client dependencies already installed${NC}"
fi

cd ..

# Summary
echo -e "\n${BLUE}================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${BLUE}================================${NC}"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Update server/.env with your config:"
echo -e "     • GEMINI_API_KEY (from makersuite.google.com)"
echo -e "     • MONGO_URI (your MongoDB Atlas URI)"
echo -e "     • ML_SERVICE_URL (default: http://localhost:8000)"

echo -e "\n${YELLOW}🚀 To Start Development:${NC}"

echo -e "\n  Terminal 1 (ML Service):"
echo -e "    ${BLUE}cd ml && source venv/bin/activate${NC}"
echo -e "    ${BLUE}python -m uvicorn app:app --port 8000 --reload${NC}"

echo -e "\n  Terminal 2 (Backend):"
echo -e "    ${BLUE}cd server && npm run dev${NC}"

echo -e "\n  Terminal 3 (Frontend):"
echo -e "    ${BLUE}cd client && npm run dev${NC}"

echo -e "\n${YELLOW}🧪 To Test:${NC}"
echo -e "  1. Create expenses via http://localhost:3000/dashboard"
echo -e "  2. Call: ${BLUE}POST /api/ai/build${NC}"
echo -e "  3. Call: ${BLUE}POST /api/ai/verdict${NC}"
echo -e "     with body: ${BLUE}{ \"question\": \"Why am I overspending?\" }${NC}"

echo -e "\n${YELLOW}📚 Documentation:${NC}"
echo -e "  Read: ${BLUE}PHASE_2_IMPLEMENTATION.md${NC}"

echo -e "\n${GREEN}Happy coding! 🎉${NC}\n"
