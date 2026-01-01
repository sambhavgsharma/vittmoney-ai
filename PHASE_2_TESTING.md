# 🧪 Phase 2 Testing Guide — Step-by-Step

This guide walks you through testing the complete Phase 2 RAG + Gemini verdict system.

---

## 📋 Prerequisites

Before testing, ensure:

1. **MongoDB** is running and accessible
2. **GEMINI_API_KEY** is set in `/server/.env`
3. **ML Service URL** is correctly configured
4. All dependencies installed (run `./setup-phase2.sh` if not)

---

## 🚀 Step 0: Start All Services

### Terminal 1: ML Service (Python)

```bash
cd ml
source venv/bin/activate
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Verify Health:**
```bash
curl http://localhost:8000/health
# {"status":"healthy"}
```

---

### Terminal 2: Backend (Node.js)

```bash
cd server
npm run dev
```

**Expected Output:**
```
[nodemon] 3.0.1
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,json
MongoDB connected
Server running on port 5000
```

**Verify Health:**
```bash
curl http://localhost:5000/health
# {"status":"healthy","db":"connected"}
```

---

### Terminal 3: Frontend (Next.js)

```bash
cd client
npm run dev
```

**Expected Output:**
```
> dev
> next dev
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
```

---

## 🧪 Test 1: ML Service Embedding

Verify the embedding service works.

```bash
curl -X POST http://localhost:8000/embed \
  -H "Content-Type: application/json" \
  -d '{
    "texts": [
      "₹500 spent on Food",
      "₹1000 spent on Transport"
    ]
  }'
```

**Expected Response:**
```json
{
  "embeddings": [
    [0.23, -0.45, 0.12, ..., 0.89],    // 384 dimensions
    [-0.11, 0.34, -0.56, ..., 0.21]    // 384 dimensions
  ]
}
```

✅ If you see two arrays of 384 values, embeddings are working!

---

## 🧪 Test 2: Create Test Expenses

Use the UI or API to create test expenses.

### Option A: Via UI

1. Open http://localhost:3000/dashboard
2. Navigate to Expenses
3. Click "Add Expense"
4. Create 3-5 expenses with different categories:
   - ₹450 - Food - Zomato - 2025-12-29
   - ₹200 - Transport - Uber - 2025-12-28
   - ₹5000 - Shopping - Amazon - 2025-12-27
   - ₹300 - Entertainment - Netflix - 2025-12-26
   - ₹1200 - Bills - Electricity - 2025-12-25

### Option B: Via API

```bash
# Get your auth token first (from login)
TOKEN="your-jwt-token"

curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 450,
    "category": "Food",
    "merchant": "Zomato",
    "description": "Lunch order",
    "date": "2025-12-29"
  }'
```

**Expected Response:**
```json
{
  "_id": "6789...",
  "userId": "user123",
  "amount": 450,
  "category": "Food",
  "merchant": "Zomato",
  "date": "2025-12-29T00:00:00.000Z",
  "createdAt": "2025-12-31T10:00:00.000Z"
}
```

✅ Repeat for all test expenses.

---

## 🧪 Test 3: Build Knowledge Base

Trigger KB generation on demand.

```bash
TOKEN="your-jwt-token"

curl -X POST http://localhost:5000/api/ai/build \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response (202 Accepted):**
```json
{
  "message": "Knowledge base build in progress",
  "userId": "user123"
}
```

**Check Backend Logs:**
```
🔨 Building knowledge base for user user123...
📊 Found 5 expenses
📝 Built 5 facts
🔗 Sending facts to ML service for embeddings...
✅ Knowledge base saved for user user123
```

⏳ **Wait 2-5 seconds** for the build to complete.

---

## 🧪 Test 4: Verify Knowledge Base Files

Check that KB was saved to disk.

```bash
ls -la server/knowledgebase/
# Should show your user's directory

ls -la server/knowledgebase/<userId>/
# Should show: facts.json, embeddings.json
```

**Check facts.json:**
```bash
cat server/knowledgebase/<userId>/facts.json
```

**Expected:**
```json
[
  "₹450 spent on Food at Zomato on 2025-12-29",
  "₹200 spent on Transport at Uber on 2025-12-28",
  "₹5000 spent on Shopping at Amazon on 2025-12-27",
  ...
]
```

**Check embeddings.json:**
```bash
cat server/knowledgebase/<userId>/embeddings.json | head -c 200
```

**Expected:**
```json
[
  [0.23, -0.45, 0.12, ..., 0.89],
  [-0.11, 0.34, -0.56, ..., 0.21],
  ...
]
```

✅ Facts and embeddings saved = KB build successful!

---

## 🧪 Test 5: Get AI Verdict

The main test! Ask the system a financial question.

```bash
TOKEN="your-jwt-token"

curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Why am I overspending this month?"
  }'
```

**Full Request Example:**
```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"question": "Why am I overspending this month?"}'
```

**Expected Response:**
```json
{
  "question": "Why am I overspending this month?",
  "verdict": "You are overspending primarily on Shopping, which accounted for ₹5,000 out of your ₹7,350 total spending in December. This is 68% of your budget.\n\nHere are my suggestions:\n\n1. **Cut Shopping by 50%** - Set a monthly cap of ₹2,500 instead of ₹5,000. Review items before purchase.\n\n2. **Food Spending is Reasonable** - ₹450 for food is healthy. Maintain this level.\n\n3. **Transport and Entertainment** - These are low (₹200 and ₹300 respectively). Focus savings on Shopping.",
  "factsUsed": [
    "₹5000 spent on Shopping at Amazon on 2025-12-27",
    "₹450 spent on Food at Zomato on 2025-12-29",
    "₹300 spent on Entertainment at Netflix on 2025-12-26",
    "₹200 spent on Transport at Uber on 2025-12-28",
    "₹1200 spent on Bills at Electricity on 2025-12-25"
  ]
}
```

✅ If you see a thoughtful, grounded verdict with specific numbers, **Phase 2 is working!**

---

## 🧪 Test 6: Different Questions

Test different financial questions.

### Question 1: Which category hurts most?

```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Which spending category is hurting me the most?"
  }'
```

**Expected:** Focus on Shopping (₹5,000).

---

### Question 2: What to reduce?

```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What should I reduce to save money?"
  }'
```

**Expected:** Specific suggestions for Shopping.

---

### Question 3: Budget analysis

```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How should I budget differently next month?"
  }'
```

**Expected:** Breakdown by category with recommendations.

---

## 🧪 Test 7: Frontend UI

Test the AI Verdict card in the dashboard.

1. Open http://localhost:3000/dashboard
2. You should see **"🤖 AI Verdict"** card
3. Click **"Analyze my spending"** button
4. Wait for loading animation
5. See verdict displayed in blue box

**Expected:**
- Button shows loading state (spinner)
- After ~2-3 seconds, verdict appears
- Verdict is grounded in your spending data
- No errors in console

---

## 🧪 Test 8: Error Handling

Test error scenarios.

### Scenario 1: No KB Built

Delete KB and try verdict:

```bash
rm -rf server/knowledgebase/<userId>

curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "Why am I overspending?"}'
```

**Expected Error (404):**
```json
{
  "message": "No knowledge base found. Please run buildKnowledgebase job first."
}
```

✅ Good — system guides user to build KB first.

---

### Scenario 2: Missing Question

```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Error (400):**
```json
{
  "message": "Question is required"
}
```

✅ Good — validates input.

---

### Scenario 3: Bad Auth Token

```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json" \
  -d '{"question": "Why am I overspending?"}'
```

**Expected Error (401):**
```json
{
  "message": "Unauthorized" // or similar
}
```

✅ Good — protects endpoint.

---

### Scenario 4: ML Service Down

Stop the ML service and try:

```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "Why am I overspending?"}'
```

**Expected Error (500):**
```json
{
  "message": "Failed to generate verdict"
}
```

**Backend Logs:**
```
Error in AI verdict: Error: connect ECONNREFUSED
```

✅ Good — graceful error handling.

---

## 📊 Test Checklist

- [ ] ML service `/embed` endpoint works
- [ ] Created 3+ test expenses
- [ ] KB build triggered successfully
- [ ] facts.json and embeddings.json saved
- [ ] `/api/ai/verdict` returns grounded response
- [ ] Response includes facts used
- [ ] Different questions get different answers
- [ ] Frontend button works and shows verdict
- [ ] Error handling works (missing KB, no question, etc)
- [ ] Can ask follow-up questions (rebuild KB, ask again)

---

## 📈 Performance Notes

- First verdict: 2-4 seconds (L2 search + Gemini call)
- Subsequent verdicts: 2-4 seconds (no caching in Phase 2)
- KB build: 5-30 seconds (depends on expense count and network)
- L2 search: <100ms (local JavaScript)
- Embedding call: 500ms-1s (ML service)
- Gemini API call: 1-2 seconds (network + LLM)

---

## 🐛 Debugging Tips

### Check Backend Logs
```bash
# Terminal 2 should show:
🔨 Building knowledge base for user ...
🔗 Sending facts to ML service...
✅ Knowledge base saved
```

### Check ML Service Logs
```bash
# Terminal 1 should show:
POST /embed - "422 Unprocessable Entity"  (if format wrong)
POST /embed - "200 OK"  (if correct)
```

### Test ML Service Directly
```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/embed -H "Content-Type: application/json" \
  -d '{"texts": ["test"]}'
```

### Check Network
```bash
# From server directory:
curl http://localhost:8000/embed  # Should work if ML service is running
```

### Check File Permissions
```bash
# Make sure KB directory is readable
chmod -R 755 server/knowledgebase/
```

---

## 🎉 Success Criteria

✅ Phase 2 is working if:

1. **Endpoints respond** - No 5xx errors
2. **KB builds** - Files saved to disk
3. **Verdict is grounded** - Uses facts from expenses
4. **Numbers are accurate** - Amounts and dates match
5. **UI works** - Button triggers verdict
6. **No speculation** - Gemini stays within facts
7. **Fast enough** - <5 seconds per verdict

---

**You've successfully tested Phase 2! 🎉**

For next steps, see `PHASE_2_IMPLEMENTATION.md`.
