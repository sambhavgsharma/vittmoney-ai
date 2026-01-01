# AI Financial Insights Feature - Implementation Guide

## Overview

The AI Financial Insights feature provides users with personalized spending analysis using:
- **Embeddings**: Sentence Transformers for semantic understanding
- **Vector Search**: FAISS for similarity search
- **LLM**: Google Gemini 1.5 Flash for intelligent analysis

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Dashboard                           │
│  (AIVerdictCard - Click "Analyze my spending")              │
└────────────────────────┬────────────────────────────────────┘
                         │ POST /api/ai/verdict
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ AI Route Handler (/routes/ai.js)                     │   │
│  │ 1. Load user's knowledge base (facts + embeddings)   │   │
│  │ 2. Embed user question via ML service                │   │
│  │ 3. FAISS similarity search (top-5 facts)             │   │
│  │ 4. Call LLM Service with prompt template             │   │
│  │ 5. Return verdict to frontend                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│     ┌───────────────────┴───────────────────┐                │
│     │                                       │                │
│     ▼                                       ▼                │
│  ┌──────────────────────┐  ┌──────────────────────────┐     │
│  │  LLM Service         │  │  Knowledge Base (Disk)   │     │
│  │  (/services/llmService.js)   │  /server/knowledgebase/   │
│  │  - Gemini 1.5 Flash  │  │    {userId}/              │     │
│  │  - Prompt template   │  │    ├── facts.json        │     │
│  │  - Safe API wrapper  │  │    └── embeddings.json   │     │
│  └──────────────────────┘  └──────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ML Service (Python)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ POST /embed - Get embeddings for texts               │   │
│  │ (Sentence Transformers - all-MiniLM-L6-v2)           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Offline Job:
┌─────────────────────────────────────────────────────────────┐
│  buildKnowledgebase.js                                      │
│  Runs periodically or on-demand:                            │
│  1. Fetch user expenses from MongoDB                        │
│  2. Build textual facts (e.g., "₹420 spent on Food...")    │
│  3. Send facts to ML service for embeddings                │
│  4. Save facts + embeddings to disk (per user)             │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Environment Variables

Add to `.env` (server):
```bash
GOOGLE_API_KEY=<your-google-api-key>
ML_SERVICE_URL=http://localhost:8000
```

### 2. Install Dependencies

**Server (Node.js)**:
```bash
cd server
npm install
```

The `@google/generative-ai` package has been added to `package.json`.

**ML Service (Python)**:
```bash
cd ml
pip install -r requirements.txt
```

Ensure `requirements.txt` includes:
```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
sentence-transformers==2.2.2
transformers==4.35.2
torch==2.1.1
faiss-cpu==1.7.4
python-multipart==0.0.6
```

### 3. Run the Services

**Start ML Service** (Terminal 1):
```bash
cd ml
python -m uvicorn app:app --reload --port 8000
```

**Start Backend** (Terminal 2):
```bash
cd server
npm run dev
```

**Start Client** (Terminal 3):
```bash
cd client
npm run dev
```

## File Structure

### Backend Files Created/Modified

```
server/
├── jobs/
│   └── buildKnowledgebase.js          [NEW] - Offline job
├── routes/
│   └── ai.js                          [NEW] - POST /api/ai/verdict
├── services/
│   └── llmService.js                  [NEW] - Gemini wrapper
├── knowledgebase/                     [NEW DIR] - Per-user KB storage
│   └── {userId}/
│       ├── facts.json
│       └── embeddings.json
├── index.js                           [MODIFIED] - Added AI routes
└── package.json                       [MODIFIED] - Added @google/generative-ai
```

### Frontend Files Created/Modified

```
client/src/
├── components/
│   └── AIVerdictCard.tsx              [NEW] - UI component
└── app/dashboard/
    └── page.tsx                       [MODIFIED] - Added AIVerdictCard
```

### ML Service Files Modified

```
ml/
└── app.py                             [MODIFIED] - Added /embed endpoint
```

## Usage Workflow

### Step 1: Build Knowledge Base (Offline Job)

**Run manually**:
```bash
cd server
node jobs/buildKnowledgebase.js
```

**Or schedule it** (e.g., cron job every 6 hours):
```bash
0 */6 * * * cd /path/to/server && node jobs/buildKnowledgebase.js >> logs/kb-build.log 2>&1
```

This will:
- Fetch all user expenses
- Build textual facts
- Get embeddings from ML service
- Save to disk per user

**Output**:
```
🚀 Starting buildKnowledgebase job...
👥 Found 5 users with expenses
🔄 Building knowledge base for user 507f1f77bcf86cd799439011...
📊 Found 47 expenses
📝 Built 47 facts
🔗 Sending facts to ML service for embeddings...
✅ Knowledge base saved for user 507f1f77bcf86cd799439011
...
✅ buildKnowledgebase job completed!
```

### Step 2: User Requests AI Verdict

1. User navigates to **Dashboard**
2. Sees **AI Verdict** card
3. Clicks **"Analyze my spending"** button
4. Backend:
   - Loads user's knowledge base
   - Embeds question: "Why am I overspending this month?"
   - Searches top-5 similar facts
   - Calls Gemini with prompt template
   - Returns verdict

**Example Response**:
```json
{
  "verdict": "Based on your spending data, here are 3 insights:\n\n1. **Food is your biggest expense** - ₹8,540 across 12 transactions (avg ₹711/order). Consider meal prep or cooking at home.\n\n2. **Transport costs spiked 34% this month** - ₹4,200 vs ₹2,800 last month. Switch to monthly passes or carpool.\n\n3. **Entertainment spending is discretionary** - ₹2,100 on movies/games. Reduce to ₹1,000/month.",
  "factsUsed": [
    "₹420 spent on Food at Zomato on 2025-12-29",
    "₹450 spent on Food at Swiggy on 2025-12-28",
    ...
  ],
  "question": "Why am I overspending this month?"
}
```

## Prompt Template

Located in `server/services/llmService.js`:

```
You are a financial assistant.

Facts about the user's spending:
{{retrieved_facts}}

Question:
{{user_question}}

Rules:
- Use only the facts above
- Be specific with numbers
- Give at most 3 actionable suggestions
- Do not speculate beyond data
```

## Key Implementation Details

### Fact Format

```
₹{amount} spent on {category} at {merchant} on {date}
```

Examples:
- `₹420 spent on Food at Zomato on 2025-12-29`
- `₹1,200 spent on Transport via Uber on 2025-12-28`
- `₹50 spent on Shopping at Amazon on 2025-12-27`

### Embedding Model

- **Model**: `all-MiniLM-L6-v2` (from Sentence Transformers)
- **Dimension**: 384
- **Speed**: Fast enough for real-time queries

### Similarity Search

- **Algorithm**: L2 distance (Euclidean)
- **Top-k**: 5 facts retrieved
- **Storage**: JSON files (can scale to FAISS binary indices later)

### LLM Configuration

- **Model**: `gemini-1.5-flash` (fast, cheap, good quality)
- **API**: Google Generative AI
- **Max output tokens**: ~500 (configurable)

## Testing

### Test the AI Endpoint

```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "question": "Why am I overspending this month?"
  }'
```

### Manual Knowledge Base Build

```bash
node server/jobs/buildKnowledgebase.js
```

Check output:
```bash
ls -la server/knowledgebase/
```

## Scaling Considerations

### Current Setup (Disk-based)
- ✅ Simple, no external dependencies
- ✅ Good for ~10k users
- ⚠️ Slower for large knowledge bases

### Future: FAISS-GPU Setup
1. Use binary FAISS indices instead of JSON
2. Add GPU support (if budget allows)
3. Pre-load indices in memory during request-time

### Future: Vector Database
1. Switch to Pinecone or Weaviate
2. Real-time embeddings
3. Better scaling

## Error Handling

### User has no knowledge base
```json
{
  "message": "No knowledge base found. Please run buildKnowledgebase job first.",
  "status": 404
}
```

### ML service unavailable
```json
{
  "message": "Failed to generate verdict",
  "status": 500
}
```

### Missing API key
```json
{
  "message": "Failed to generate verdict",
  "status": 500
}
```

## Monitoring & Debugging

### Check ML Service Health
```bash
curl http://localhost:8000/health
```

### Check Knowledge Base Built
```bash
ls server/knowledgebase/
```

### Monitor API Calls
```bash
# Check logs
tail -f server/logs/app.log
```

## Security Notes

1. **API Key**: Keep `GOOGLE_API_KEY` in `.env`, never commit
2. **Auth**: `/api/ai/verdict` protected by `authMiddleware`
3. **Data**: User sees only their own knowledge base
4. **Privacy**: Facts stored locally, not sent externally except to Gemini API

## Future Enhancements

1. **Chat Interface**: Allow follow-up questions
2. **Scheduled Insights**: Weekly/monthly AI summaries
3. **Budget Alerts**: AI-powered spending alerts
4. **Goal Tracking**: AI suggestions for savings goals
5. **Multi-language**: Support Hindi, Spanish, etc.
6. **Custom Models**: Fine-tuned models per user

## FAQ

**Q: How often should I build the knowledge base?**
A: Recommend every 6-12 hours, or daily. Adjust based on user activity.

**Q: Can I use a different LLM?**
A: Yes! Update `llmService.js` to use OpenAI, Anthropic, etc.

**Q: What if a user has 1000 expenses?**
A: All 1000 facts are embedded. Top-5 similar ones are used. Current setup handles this fine.

**Q: Why store on disk instead of a real vector DB?**
A: To keep it simple for now. Upgrade when you hit ~100k users or need real-time updates.

**Q: How much does Gemini API cost?**
A: Gemini 1.5 Flash is $0.075 per 1M input tokens. Most verdicts use 1-2k tokens (~0.00001 per verdict).

---

**Happy deploying!** 🚀
