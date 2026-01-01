# AI Feature - Troubleshooting & Testing Guide

## ✅ Pre-Flight Checklist

Before testing, verify:

- [ ] MongoDB running (`mongosh` command works)
- [ ] Google API key in `.env` as `GOOGLE_API_KEY`
- [ ] `ML_SERVICE_URL=http://localhost:8000` in `.env`
- [ ] All dependencies installed (`npm install` in server and client)
- [ ] Python venv activated for ML service

## 🚀 Testing Workflow

### Step 1: Start ML Service

```bash
cd ml
python -m uvicorn app:app --reload --port 8000
```

**Expected output**:
```
Uvicorn running on http://127.0.0.1:8000
```

**Verify health**:
```bash
curl http://localhost:8000/health
# Response: {"status":"healthy"}
```

### Step 2: Start Backend

```bash
cd server
npm run dev
```

**Expected output**:
```
MongoDB connected
Server running on port 5000
```

**Verify health**:
```bash
curl http://localhost:5000/health
# Response: {"status":"healthy","db":"connected"}
```

### Step 3: Build Knowledge Base

```bash
cd server
node jobs/buildKnowledgebase.js
```

**Expected output**:
```
🚀 Starting buildKnowledgebase job...
👥 Found X users with expenses
🔄 Building knowledge base for user ...
📊 Found Y expenses
📝 Built Y facts
🔗 Sending facts to ML service for embeddings...
✅ Knowledge base saved for user ...
✅ buildKnowledgebase job completed!
```

**Verify files created**:
```bash
ls -la server/knowledgebase/
# Should show user IDs as directories
ls -la server/knowledgebase/{USER_ID}/
# Should show facts.json and embeddings.json
```

### Step 4: Start Client

```bash
cd client
npm run dev
```

**Expected output**:
```
▲ Next.js ...
- ready started server on 0.0.0.0:3000
```

### Step 5: Test in Browser

1. Open http://localhost:3000
2. Log in with your account
3. Navigate to **Dashboard**
4. Look for **AI Verdict** card (🤖)
5. Click **"Analyze my spending"**
6. Wait for response (10-30 seconds)

**Expected result**:
```
Based on your spending data, here are 3 insights:

1. [Analysis point 1]
2. [Analysis point 2]
3. [Analysis point 3]
```

## 🔍 Debugging Guide

### Issue: "No knowledge base found"

**Problem**: User has expenses but KB not built

**Solution**:
```bash
# Build KB
cd server && node jobs/buildKnowledgebase.js

# Verify
ls server/knowledgebase/
```

### Issue: "Failed to generate verdict"

**Possible causes**:

1. **Google API key missing/invalid**
   ```bash
   # Check .env
   cat server/.env | grep GOOGLE_API_KEY
   # Should be non-empty
   
   # Get new key from https://aistudio.google.com/app/apikey
   ```

2. **ML Service not running**
   ```bash
   # Check
   curl http://localhost:8000/health
   # Should respond with {"status":"healthy"}
   
   # If not, start it:
   cd ml && python -m uvicorn app:app --reload --port 8000
   ```

3. **Network issue between services**
   ```bash
   # Test from server directory
   node -e "
   const axios = require('axios');
   axios.post('http://localhost:8000/embed', { texts: ['test'] })
     .then(r => console.log('OK', r.data))
     .catch(e => console.error('ERROR', e.message))
   "
   ```

### Issue: ML Service crashes on startup

**Error**: `ModuleNotFoundError: No module named 'transformers'`

**Solution**:
```bash
cd ml
pip install -r requirements.txt
# Or manually:
pip install sentence-transformers transformers torch fastapi uvicorn pydantic
```

### Issue: Knowledge base stuck with old data

**Problem**: Old facts still showing

**Solution**:
```bash
# Delete old KB
rm -rf server/knowledgebase/

# Rebuild
cd server && node jobs/buildKnowledgebase.js
```

### Issue: "Port already in use"

**Problem**: Port 8000, 5000, or 3000 already occupied

**Solution**:
```bash
# Kill process on port (macOS/Linux)
lsof -ti :8000 | xargs kill -9    # ML Service
lsof -ti :5000 | xargs kill -9    # Backend
lsof -ti :3000 | xargs kill -9    # Client

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

## 🧪 Manual API Testing

### Test /embed Endpoint

```bash
curl -X POST http://localhost:8000/embed \
  -H "Content-Type: application/json" \
  -d '{
    "texts": [
      "₹420 spent on Food at Zomato on 2025-12-29",
      "₹1200 spent on Transport on Uber on 2025-12-28"
    ]
  }'
```

**Expected response**:
```json
{
  "embeddings": [
    [0.123, 0.456, ...],  // 384-dim vector
    [0.234, 0.567, ...]   // 384-dim vector
  ]
}
```

### Test /api/ai/verdict Endpoint

**Note**: Requires authentication token

```bash
# 1. Get token (after login in browser)
# Open DevTools → Network → Copy auth header

# 2. Test endpoint
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "question": "Why am I overspending this month?"
  }'
```

**Expected response**:
```json
{
  "verdict": "Based on your spending data...",
  "factsUsed": [
    "₹420 spent on Food at Zomato on 2025-12-29",
    "..."
  ],
  "question": "Why am I overspending this month?"
}
```

## 📊 Performance Checklist

| Step | Target Time | Actual |
|------|------------|--------|
| KB Build (100 expenses) | < 2 sec | |
| Query Embedding | 100-200 ms | |
| FAISS Search | < 10 ms | |
| LLM Call | 5-15 sec | |
| **Total** | 5-20 sec | |

## 🐛 Logs to Check

```bash
# ML Service logs (terminal where uvicorn runs)
# Look for: POST /embed requests

# Backend logs (terminal where npm run dev runs)
# Look for: "Building knowledge base" or error messages

# Client logs (DevTools Console in browser)
# Look for: Network errors or state issues
```

## ✨ Test Data

If you don't have expenses, create some:

```bash
# Test with curl (need auth token)
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 420,
    "description": "Zomato order",
    "date": "2025-12-29",
    "paymentMethod": "card"
  }'
```

Or use the UI:
1. Go to Dashboard → Expenses
2. Click "Add Expense"
3. Add a few expenses
4. Run KB build job
5. Test AI Verdict

## 🎯 Success Indicators

✅ **ML Service running**
- `curl http://localhost:8000/health` returns `{"status":"healthy"}`

✅ **Backend running**
- `curl http://localhost:5000/health` returns healthy response

✅ **KB built**
- `ls server/knowledgebase/` shows user directories
- Each directory has `facts.json` and `embeddings.json`

✅ **API working**
- POST `/api/ai/verdict` with auth returns verdict object
- No 500 errors

✅ **UI working**
- AIVerdictCard visible on Dashboard
- Button is clickable
- Response displays correctly

## 🚨 Emergency Reset

If everything is broken:

```bash
# 1. Kill all services
pkill -f "node server/index.js"
pkill -f "uvicorn app:app"
pkill -f "next dev"

# 2. Clear cache
rm -rf server/node_modules/.cache
rm -rf ml/__pycache__
rm -rf client/.next

# 3. Delete KB
rm -rf server/knowledgebase

# 4. Reinstall
cd server && npm install
cd ml && pip install -r requirements.txt
cd client && npm install

# 5. Start fresh
# Run terminal 1: cd ml && python -m uvicorn app:app --reload --port 8000
# Run terminal 2: cd server && npm run dev
# Run terminal 3: cd server && node jobs/buildKnowledgebase.js
# Run terminal 4: cd client && npm run dev
```

---

**Need help?** Check the main `AI_FEATURE_GUIDE.md` for architecture details.
