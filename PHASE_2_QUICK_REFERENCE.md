# 🎯 PHASE 2 QUICK REFERENCE

## 🚀 One-Command Setup

```bash
cd /home/jon-snow/Tech/Projects/vittmoney-ai
./setup-phase2.sh
```

---

## 📌 Three Terminals

### Terminal 1: ML Service
```bash
cd ml && source venv/bin/activate
python -m uvicorn app:app --port 8000 --reload
```
✅ Runs on http://localhost:8000

### Terminal 2: Backend
```bash
cd server && npm run dev
```
✅ Runs on http://localhost:5000

### Terminal 3: Frontend
```bash
cd client && npm run dev
```
✅ Runs on http://localhost:3000

---

## 🧪 Quick Test

### 1. Check Services
```bash
curl http://localhost:8000/health
curl http://localhost:5000/health
```

### 2. Create Expenses (UI or API)
- Go to http://localhost:3000/dashboard
- Create 3-5 expenses

### 3. Build Knowledge Base
```bash
curl -X POST http://localhost:5000/api/ai/build \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{}'
```

### 4. Get Verdict
```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"question": "Why am I overspending?"}'
```

### 5. Check UI
- Go to http://localhost:3000/dashboard
- Click "Analyze my spending"
- See verdict appear!

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `/ml/embeddings.py` | Text → Vectors |
| `/ml/vector_store.py` | Vector search (FAISS) |
| `/ml/app.py` | ML API endpoints |
| `/server/routes/ai.js` | Verdict endpoints |
| `/server/services/llmService.js` | Gemini wrapper |
| `/server/jobs/buildKnowledgebase.js` | KB generator |
| `/client/components/AIVerdictCard.tsx` | UI component |

---

## 🔧 Environment Setup

**Required in `/server/.env`:**
```
GEMINI_API_KEY=<from-makersuite.google.com>
MONGO_URI=<your-mongo-atlas-uri>
JWT_SECRET=<random-string>
ML_SERVICE_URL=http://localhost:8000
```

---

## 🔄 API Endpoints

### Build Knowledge Base
```
POST /api/ai/build
Auth: Required
Response: { status: "accepted", userId: "..." }
Async: Yes (processing in background)
```

### Get Verdict
```
POST /api/ai/verdict
Auth: Required
Body: { "question": "your question?" }
Response: { verdict: "...", factsUsed: [...] }
Async: No (returns in 2-4 seconds)
```

---

## 💡 Example Questions

```
"Why am I overspending this month?"
"What should I reduce next?"
"Which category is hurting me the most?"
"How should I budget differently?"
"Where am I wasting money?"
```

---

## ✅ What Works

- ✅ Embeddings (384-dim vectors)
- ✅ FAISS vector search (L2 distance)
- ✅ Knowledge base generation
- ✅ Gemini verdict generation
- ✅ Full end-to-end pipeline
- ✅ Error handling
- ✅ Clean UI

---

## 🛑 Common Issues

| Issue | Fix |
|-------|-----|
| `GEMINI_API_KEY not found` | Add to `.env` |
| `ML service refused` | Start on port 8000 |
| `No KB found` | Run `/api/ai/build` first |
| `Timeout` | Increase wait time |
| `Auth failed` | Check JWT token |

---

## 📊 Performance

| Operation | Time |
|-----------|------|
| Embed text | 100-200ms |
| Search (L2) | <50ms |
| Gemini API | 1-2s |
| **Full Verdict** | **2-4s** |

---

## 📚 Documentation

- `PHASE_2_IMPLEMENTATION.md` - Full guide
- `PHASE_2_TESTING.md` - Testing procedures
- `PHASE_2_COMPLETION_SUMMARY.md` - Status + details

---

## 🎯 Success = ?

✅ Endpoints respond  
✅ KB builds to disk  
✅ Verdict is grounded  
✅ Numbers are accurate  
✅ UI shows results  
✅ <5 second response  

---

**You're all set! 🚀**

See full documentation in `PHASE_2_IMPLEMENTATION.md`
