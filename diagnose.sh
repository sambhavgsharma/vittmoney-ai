#!/bin/bash

# 🔍 DIAGNOSTIC SCRIPT - Check All Services & Configuration
# Run this to diagnose the "Unexpected token '<'" error

echo "=================================================="
echo "🔍 VittMoney AI - Complete Diagnostic Check"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for issues
ISSUES=0

# 1. Check if services are running
echo "📡 Checking if services are running..."
echo ""

# ML Service
echo -n "  ML Service (port 8000): "
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
    HEALTH=$(curl -s http://localhost:8000/health)
    echo "      Response: $HEALTH"
else
    echo -e "${RED}❌ NOT running${NC}"
    echo "      Fix: Start ML service with: cd /ml && source venv/bin/activate && python -m uvicorn app:app --port 8000 --reload"
    ((ISSUES++))
fi
echo ""

# Backend Service
echo -n "  Backend Service (port 5000): "
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
    HEALTH=$(curl -s http://localhost:5000/health)
    echo "      Response: $HEALTH"
else
    echo -e "${RED}❌ NOT running${NC}"
    echo "      Fix: Start backend with: cd /server && npm run dev"
    ((ISSUES++))
fi
echo ""

# Frontend Service
echo -n "  Frontend Service (port 3000): "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ NOT running${NC}"
    echo "      Fix: Start frontend with: cd /client && npm run dev"
    ((ISSUES++))
fi
echo ""

# 2. Check configuration files
echo "⚙️  Checking Configuration..."
echo ""

# Gemini API Key
echo -n "  GEMINI_API_KEY: "
if grep -q "GEMINI_API_KEY=" /home/jon-snow/Tech/Projects/vittmoney-ai/server/.env; then
    KEY=$(grep "GEMINI_API_KEY=" /home/jon-snow/Tech/Projects/vittmoney-ai/server/.env | cut -d'=' -f2)
    if [ -z "$KEY" ]; then
        echo -e "${YELLOW}⚠️  Empty${NC}"
        echo "      Fix: Add your API key to /server/.env"
        ((ISSUES++))
    else
        echo -e "${GREEN}✅ Set${NC}"
        # Show first 20 chars
        echo "      Value: ${KEY:0:20}..."
    fi
else
    echo -e "${RED}❌ Missing${NC}"
    echo "      Fix: Add GEMINI_API_KEY to /server/.env"
    ((ISSUES++))
fi
echo ""

# MongoDB Connection
echo -n "  MONGO_URI: "
if grep -q "MONGO_URI=" /home/jon-snow/Tech/Projects/vittmoney-ai/server/.env; then
    echo -e "${GREEN}✅ Set${NC}"
else
    echo -e "${RED}❌ Missing${NC}"
    echo "      Fix: Add MONGO_URI to /server/.env"
    ((ISSUES++))
fi
echo ""

# ML Service URL
echo -n "  ML_SERVICE_URL: "
if grep -q "ML_SERVICE_URL=" /home/jon-snow/Tech/Projects/vittmoney-ai/server/.env; then
    URL=$(grep "ML_SERVICE_URL=" /home/jon-snow/Tech/Projects/vittmoney-ai/server/.env | cut -d'=' -f2)
    echo -e "${GREEN}✅ Set${NC} ($URL)"
else
    echo -e "${YELLOW}⚠️  Using default${NC} (http://localhost:8000)"
fi
echo ""

# 3. Check file structure
echo "📁 Checking File Structure..."
echo ""

# requirements.txt
echo -n "  /ml/requirements.txt: "
if [ -f /home/jon-snow/Tech/Projects/vittmoney-ai/ml/requirements.txt ]; then
    echo -e "${GREEN}✅ Exists${NC}"
else
    echo -e "${RED}❌ Missing${NC}"
    ((ISSUES++))
fi
echo ""

# ai.js route file
echo -n "  /server/routes/ai.js: "
if [ -f /home/jon-snow/Tech/Projects/vittmoney-ai/server/routes/ai.js ]; then
    echo -e "${GREEN}✅ Exists${NC}"
    if grep -q "Error embedding question" /home/jon-snow/Tech/Projects/vittmoney-ai/server/routes/ai.js; then
        echo "      ✅ Error handling: Present"
    else
        echo "      ⚠️  Error handling: May need update"
    fi
else
    echo -e "${RED}❌ Missing${NC}"
    ((ISSUES++))
fi
echo ""

# llmService.js
echo -n "  /server/services/llmService.js: "
if [ -f /home/jon-snow/Tech/Projects/vittmoney-ai/server/services/llmService.js ]; then
    echo -e "${GREEN}✅ Exists${NC}"
    if grep -q "generateVerdict" /home/jon-snow/Tech/Projects/vittmoney-ai/server/services/llmService.js; then
        echo "      ✅ Verdict function: Implemented"
    fi
else
    echo -e "${RED}❌ Missing${NC}"
    ((ISSUES++))
fi
echo ""

# 4. Check npm packages
echo "📦 Checking NPM Packages..."
echo ""

echo -n "  @google/generative-ai: "
if grep -q "@google/generative-ai" /home/jon-snow/Tech/Projects/vittmoney-ai/server/package.json; then
    echo -e "${GREEN}✅ In package.json${NC}"
else
    echo -e "${RED}❌ Missing from package.json${NC}"
    echo "      Fix: Run 'npm install @google/generative-ai' in /server"
    ((ISSUES++))
fi
echo ""

echo -n "  axios: "
if grep -q '"axios"' /home/jon-snow/Tech/Projects/vittmoney-ai/server/package.json; then
    echo -e "${GREEN}✅ In package.json${NC}"
else
    echo -e "${RED}❌ Missing${NC}"
    ((ISSUES++))
fi
echo ""

# 5. Check Python environment
echo "🐍 Checking Python Environment..."
echo ""

if [ -d /home/jon-snow/Tech/Projects/vittmoney-ai/ml/venv ]; then
    echo -e "  Virtual environment: ${GREEN}✅ Exists${NC}"
    
    # Check installed packages
    echo -n "  SentenceTransformer: "
    if /home/jon-snow/Tech/Projects/vittmoney-ai/ml/venv/bin/python -c "import sentence_transformers" 2>/dev/null; then
        echo -e "${GREEN}✅ Installed${NC}"
    else
        echo -e "${RED}❌ Not installed${NC}"
        echo "      Fix: Run 'pip install sentence-transformers' in venv"
        ((ISSUES++))
    fi
    
    echo -n "  FAISS: "
    if /home/jon-snow/Tech/Projects/vittmoney-ai/ml/venv/bin/python -c "import faiss" 2>/dev/null; then
        echo -e "${GREEN}✅ Installed${NC}"
    else
        echo -e "${RED}❌ Not installed${NC}"
        echo "      Fix: Run 'pip install faiss-cpu' in venv"
        ((ISSUES++))
    fi
    
    echo -n "  FastAPI: "
    if /home/jon-snow/Tech/Projects/vittmoney-ai/ml/venv/bin/python -c "import fastapi" 2>/dev/null; then
        echo -e "${GREEN}✅ Installed${NC}"
    else
        echo -e "${RED}❌ Not installed${NC}"
        ((ISSUES++))
    fi
else
    echo -e "  Virtual environment: ${RED}❌ Not found${NC}"
    echo "      Fix: Create venv and install dependencies"
    ((ISSUES++))
fi
echo ""

# 6. Test endpoints
echo "🧪 Testing Endpoints..."
echo ""

echo -n "  GET /health (Backend): "
RESPONSE=$(curl -s http://localhost:5000/health 2>&1)
if echo "$RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Responds with JSON${NC}"
else
    echo -e "${RED}❌ Not responding correctly${NC}"
    echo "      Response: $RESPONSE"
    ((ISSUES++))
fi
echo ""

echo -n "  GET /health (ML Service): "
RESPONSE=$(curl -s http://localhost:8000/health 2>&1)
if echo "$RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Responds with JSON${NC}"
else
    echo -e "${RED}❌ Not responding correctly${NC}"
    echo "      Response: $RESPONSE"
    ((ISSUES++))
fi
echo ""

# 7. Check for knowledge base
echo "🗂️  Checking Knowledge Bases..."
echo ""

KB_DIR="/home/jon-snow/Tech/Projects/vittmoney-ai/server/knowledgebase"
if [ -d "$KB_DIR" ]; then
    KB_COUNT=$(find "$KB_DIR" -type d -mindepth 1 | wc -l)
    echo "  Knowledge bases found: $KB_COUNT"
    if [ $KB_COUNT -gt 0 ]; then
        echo -e "  ${GREEN}✅ At least one KB exists${NC}"
        # Show details
        find "$KB_DIR" -type d -mindepth 1 | while read kb_path; do
            user_id=$(basename "$kb_path")
            if [ -f "$kb_path/facts.json" ] && [ -f "$kb_path/embeddings.json" ]; then
                echo "      ✅ User $user_id: Complete KB (facts + embeddings)"
            else
                echo "      ⚠️  User $user_id: Incomplete KB"
            fi
        done
    else
        echo -e "  ${YELLOW}⚠️  No KBs built yet${NC}"
        echo "      Build your first KB with: POST /api/ai/build"
    fi
else
    echo -e "  ${YELLOW}⚠️  Knowledge base directory not created${NC}"
    echo "      Will be created on first build"
fi
echo ""

# Summary
echo "=================================================="
echo "📊 Summary"
echo "=================================================="

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Login to http://localhost:3000"
    echo "  2. Create 5+ expenses in the Expenses section"
    echo "  3. Go to Dashboard"
    echo "  4. Click 'Analyze my spending' button"
    echo "  5. Verdict should appear in blue box"
else
    echo -e "${RED}❌ Found $ISSUES issue(s)${NC}"
    echo ""
    echo "Please fix the issues above and try again."
fi

echo ""
echo "📖 For detailed help, see:"
echo "   - QUICK_TEST_JSON_FIX.md (quick fixes)"
echo "   - TROUBLESHOOTING_JSON_ERROR.md (detailed troubleshooting)"
echo ""
