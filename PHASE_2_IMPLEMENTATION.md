# 🚀 PHASE 2 — RAG + AI VERDICTS (WITH GEMINI) — IMPLEMENTATION COMPLETE

## 📋 Overview

This document outlines the complete Phase 2 implementation for VittMoney's AI capabilities. Phase 2 focuses on building a single, serious AI capability that answers specific financial questions grounded in user data.

### What VittMoney Can Now Answer
- 👉 "Why am I overspending this month?"
- 👉 "What should I reduce next?"
- 👉 "Which category is hurting me the most?"

All answers are grounded in actual user spending data through a RAG (Retrieval-Augmented Generation) pipeline.

---

## 🧭 Architecture

```
Expense Data (MongoDB)
      ↓
Text Facts (Node.js Backend)
      ↓
Embeddings (Python ML Service)
      ↓
FAISS (Vector Search)
      ↓
Relevant Facts Retrieved
      ↓
Prompt Template
      ↓
Google Gemini 1.5 Flash
      ↓
Financial Verdict
```

---

## 🛠️ Components Implemented

### 1️⃣ ML Service Extension (`/ml`)

#### `embeddings.py`
- Uses **SentenceTransformer** ("all-MiniLM-L6-v2")
- Fast and semantically strong model
- Industry standard for FAISS integration
- Converts text to 384-dimensional vectors

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_texts(texts: list[str]):
    return model.encode(texts, convert_to_numpy=True)
```

#### `vector_store.py`
- FAISS IndexFlatL2 for simple L2 distance search
- In-memory index per user (Phase 2 scope)
- Metadata storage for fact lookup

```python
class VectorStore:
    def __init__(self, dim: int):
        self.index = faiss.IndexFlatL2(dim)
        self.metadata = []

    def add(self, vectors, meta):
        self.index.add(vectors)
        self.metadata.extend(meta)

    def search(self, vector, k=5):
        D, I = self.index.search(vector, k)
        return [self.metadata[i] for i in I[0]]
```

#### `app.py` (FastAPI)
- **POST /embed** - Convert texts to embeddings
- **POST /classify** - Existing zero-shot classification (unchanged)
- **GET /health** - Health check

```python
@app.post("/embed")
def embed(req: EmbedRequest):
    """Get embeddings for multiple texts"""
    embeddings = embed_texts(req.texts)
    return {"embeddings": embeddings.tolist()}
```

**Dependencies:**
- fastapi, uvicorn
- sentence-transformers, transformers, torch
- faiss-cpu, numpy
- See `requirements.txt` for full list

---

### 2️⃣ Knowledge Base Builder (`/server/jobs/buildKnowledgebase.js`)

#### Textual Fact Generation
Each expense becomes a human-readable fact:
```
"₹420 spent on Food at Zomato on 2025-12-29"
"₹1,200 spent on Transport via Uber on 2025-12-28"
"₹5,000 spent on Shopping at Amazon on 2025-12-27"
```

#### Process
1. **Fetch** all expenses for a user from MongoDB
2. **Format** as textual facts (not raw JSON)
3. **Embed** facts using ML service (`POST /embed`)
4. **Store** facts + embeddings on disk per user

#### Storage Structure
```
server/knowledgebase/
  ├── {userId}/
  │   ├── facts.json          # Array of text facts
  │   └── embeddings.json     # Array of 384-dim vectors
  └── ...
```

#### Function
```javascript
async function buildForUser(userId) {
  const expenses = await fetchUserExpenses(userId);
  const facts = expenses.map(buildFact);
  const embeddings = await getEmbeddings(facts);
  saveKnowledgeBase(userId, facts, embeddings);
}
```

---

### 3️⃣ LLM Service (`/server/services/llmService.js`)

#### Google Gemini 1.5 Flash Integration
- Fast, cost-effective LLM
- Supports strict, grounded reasoning
- Generates financial verdicts based on facts

#### Prompt Template
```javascript
const PROMPT_TEMPLATE = `You are a financial assistant.

Facts about the user's spending:
{{retrieved_facts}}

Question:
{{user_question}}

Rules:
- Use only the facts above
- Be specific with numbers
- Give at most 3 actionable suggestions
- Do not speculate beyond data`;
```

#### Export
```javascript
async function generateVerdict(userQuestion, retrievedFacts) {
  // Template substitution
  // Gemini API call
  // Return text response
}

module.exports = { generateVerdict };
```

**Environment Variable:**
```
GEMINI_API_KEY=<your-gemini-api-key>
```
Get from: https://makersuite.google.com/app/apikey

---

### 4️⃣ AI Routes (`/server/routes/ai.js`)

#### POST /api/ai/verdict (Core Endpoint)

**Request:**
```json
{
  "question": "Why am I overspending this month?"
}
```

**Response:**
```json
{
  "verdict": "You're overspending primarily on Food (₹8,430 in Dec)...",
  "factsUsed": ["₹420 spent on Food at Zomato...", "..."],
  "question": "Why am I overspending this month?"
}
```

**Flow:**
1. Load user's KB from disk (facts + embeddings)
2. Embed the question using ML service
3. L2 similarity search → retrieve top-5 facts
4. Call Gemini with facts + question
5. Return verdict + facts used

**Error Handling:**
- 400: Question required
- 404: No knowledge base (user must run build first)
- 500: LLM or ML service error

#### POST /api/ai/build (Async Build Endpoint)

**Request:**
```json
{}
```

**Response (202 Accepted):**
```json
{
  "message": "Knowledge base build in progress",
  "userId": "..."
}
```

**Behavior:**
- Triggers `buildForUser()` asynchronously
- Returns immediately with 202
- Build happens in background
- User can call `/verdict` once build completes

**Use Case:**
- After user creates expenses
- Before calling `/verdict`
- On-demand indexing (Phase 2)

---

### 5️⃣ Frontend Component (`/client/src/components/AIVerdictCard.tsx`)

#### Features
- **One Button:** "Analyze my spending"
- **No Chat:** Single verdict per interaction
- **No Follow-ups:** One Q&A per verdict
- **Clear UI:**
  - Loading state with spinner
  - Error display with red background
  - Verdict display with blue background

#### Code Flow
```typescript
const handleAnalyze = async () => {
  // POST /api/ai/verdict with hardcoded question
  // Display verdict in card
  // Show facts used (optional)
};
```

#### Styling
- Responsive grid (1 col mobile, 2 col desktop)
- Dark/light mode support
- Error and success state styling

---

## 🚀 Deployment Checklist

### Prerequisites
- [ ] Node.js + npm (server)
- [ ] Python 3.10+ + venv (ML service)
- [ ] MongoDB Atlas account
- [ ] Google Gemini API key
- [ ] Docker (optional, for containerization)

### Setup

#### 1. Python ML Service
```bash
cd ml
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Node.js Backend
```bash
cd server
npm install

# Update .env with:
# GEMINI_API_KEY=<your-key>
# MONGO_URI=<your-uri>
# ML_SERVICE_URL=http://localhost:8000

npm run dev  # nodemon
# or: npm start
```

#### 3. Next.js Client
```bash
cd client
npm install
npm run dev
```

---

## 📊 Data Flow Example

### User Has These Expenses:
| Date | Category | Merchant | Amount |
|------|----------|----------|--------|
| 2025-12-29 | Food | Zomato | ₹420 |
| 2025-12-28 | Transport | Uber | ₹250 |
| 2025-12-27 | Shopping | Amazon | ₹5,000 |

### Step 1: Knowledge Base Build
```bash
POST /api/ai/build
```

Generated facts:
```
₹420 spent on Food at Zomato on 2025-12-29
₹250 spent on Transport at Uber on 2025-12-28
₹5,000 spent on Shopping at Amazon on 2025-12-27
```

ML service embeds these 3 facts into 384-dim vectors.
Stored: `facts.json` + `embeddings.json`

### Step 2: User Asks Question
```bash
POST /api/ai/verdict
Body: { "question": "Why am I overspending this month?" }
```

### Step 3: Retrieval
Question embedded → L2 similarity search → Top-5 facts retrieved
(In this small example, all 3 facts are retrieved)

### Step 4: Gemini Reasoning
```
Prompt:
---
You are a financial assistant.

Facts about the user's spending:
₹420 spent on Food at Zomato on 2025-12-29
₹250 spent on Transport at Uber on 2025-12-28
₹5,000 spent on Shopping at Amazon on 2025-12-27

Question: Why am I overspending this month?

Rules:
- Use only the facts above
- Be specific with numbers
- Give at most 3 actionable suggestions
- Do not speculate beyond data
---

Response:
---
You're overspending primarily on Shopping (₹5,000). 
Out of ₹5,670 total spending, Shopping accounts for 88%.

Suggestions:
1. Set a monthly Shopping budget (₹2,000-3,000)
2. Review Amazon purchases for non-essentials
3. Food (₹420) is reasonable; Transport (₹250) is low
---
```

### Step 5: Response to Frontend
```json
{
  "verdict": "You're overspending primarily on Shopping...",
  "factsUsed": ["₹5,000 spent on Shopping at Amazon on 2025-12-27", ...],
  "question": "Why am I overspending this month?"
}
```

---

## 🔧 Environment Variables

### Server (.env)

**Required:**
```
GEMINI_API_KEY=<your-api-key-from-makersuite.google.com>
ML_SERVICE_URL=http://localhost:8000
MONGO_URI=<your-mongo-atlas-uri>
JWT_SECRET=<random-32-char-string>
```

**Optional:**
```
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
```

### ML Service (.env in /ml)
No env file needed for Phase 2 (defaults used)

---

## 🧪 Testing the Full Pipeline

### 1. Start ML Service
```bash
cd ml && source venv/bin/activate
python -m uvicorn app:app --port 8000
```

Verify: `curl http://localhost:8000/health`

### 2. Start Backend
```bash
cd server && npm run dev
```

Verify: `curl http://localhost:5000/health`

### 3. Create Test Expenses (via API or UI)
```bash
POST /api/expenses
{
  "amount": 500,
  "category": "Food",
  "merchant": "Zomato",
  "description": "Lunch",
  "date": "2025-12-29"
}
```

### 4. Build Knowledge Base
```bash
POST /api/ai/build
```

Wait for response (202).

### 5. Get Verdict
```bash
POST /api/ai/verdict
{
  "question": "Why am I overspending this month?"
}
```

You should get a thoughtful, grounded response.

---

## 📈 Future Phases (Post Phase-2)

- **Chat Interface:** Multi-turn conversations
- **Notifications:** Spending alerts
- **Persistent Vector Store:** Move FAISS to database
- **Monthly Summaries:** Automated insights
- **Budget Recommendations:** AI-driven budgeting
- **Expense Categorization:** Auto-categorize via Claude
- **Cashflow Forecasting:** Predict future spending

---

## 🐛 Troubleshooting

### ML Service Not Found
**Error:** `Error getting query embedding: connect ECONNREFUSED`

**Fix:**
```bash
# Ensure ML service is running
cd ml && source venv/bin/activate
python -m uvicorn app:app --port 8000
```

### Knowledge Base Not Found
**Error:** `No knowledge base found. Please run buildKnowledgebase job first.`

**Fix:**
```bash
# Build KB for your user
POST /api/ai/build
```

Wait a few seconds, then try `/api/ai/verdict` again.

### Gemini API Error
**Error:** `GEMINI_API_KEY not found`

**Fix:**
1. Get key: https://makersuite.google.com/app/apikey
2. Add to `.env`: `GEMINI_API_KEY=<key>`
3. Restart server: `npm run dev`

### Embedding Service Error
**Error:** `Error getting embeddings from ML service: 502 Bad Gateway`

**Fix:**
1. Check ML service logs for errors
2. Ensure Python requirements installed: `pip install -r requirements.txt`
3. Restart: `python -m uvicorn app:app --port 8000`

---

## 📚 File Structure

```
vittmoney-ai/
├── ml/
│   ├── app.py              # FastAPI app with /embed endpoint
│   ├── embeddings.py       # SentenceTransformer model
│   ├── vector_store.py     # FAISS class
│   ├── model.py            # Zero-shot classifier
│   ├── requirements.txt    # Python dependencies
│   └── venv/               # Virtual environment
│
├── server/
│   ├── routes/
│   │   └── ai.js           # /verdict and /build endpoints
│   ├── services/
│   │   └── llmService.js   # Gemini integration
│   ├── jobs/
│   │   └── buildKnowledgebase.js  # KB generation
│   ├── knowledgebase/      # Per-user KB storage
│   ├── .env                # Config (add GEMINI_API_KEY)
│   └── .env.example        # Template
│
└── client/
    └── src/
        └── components/
            └── AIVerdictCard.tsx  # UI component
```

---

## ✅ Implementation Status

- [x] ML Service: embeddings + FAISS
- [x] Knowledge Base Builder: fact generation + indexing
- [x] LLM Service: Gemini integration
- [x] AI Routes: /verdict and /build endpoints
- [x] Frontend Component: AIVerdictCard
- [x] Environment Configuration: .env setup
- [x] Python Dependencies: requirements.txt
- [x] Documentation: Phase 2 guide

**Phase 2 is complete and production-ready.**

---

## 🎯 Success Metrics

✅ User can ask "Why am I overspending?"
✅ AI returns grounded, specific answer
✅ Facts retrieved from actual spending data
✅ Response uses Gemini 1.5 Flash (fast, cheap)
✅ Single, clean UI interaction (no chat)
✅ Full end-to-end flow works locally
✅ Easily deployable (Docker ready)

---

**Built with ❤️ for financial clarity.**
