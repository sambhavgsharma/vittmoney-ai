# 🔧 TROUBLESHOOTING GUIDE — "Unexpected token '<'"

## Problem
Frontend shows error: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

This means the backend is returning HTML instead of JSON, usually an error page.

---

## 🔍 Root Causes

### 1. **Knowledge Base Not Built**
**Symptom:** Error appears immediately when clicking "Analyze my spending"

**Fix:**
```bash
# Build KB first (before trying verdict)
curl -X POST http://localhost:5000/api/ai/build \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Then wait 10-30 seconds** for KB to build.

Check if built:
```bash
ls -la server/knowledgebase/<userId>/
# Should show: facts.json and embeddings.json
```

---

### 2. **ML Service Not Running**
**Symptom:** Error after KB is built, when trying to get verdict

**Fix:**
```bash
# Check if ML service is running
curl http://localhost:8000/health

# If error, restart it
cd /ml && source venv/bin/activate
python -m uvicorn app:app --port 8000 --reload
```

---

### 3. **Gemini API Key Invalid**
**Symptom:** Error occurs 1-2 seconds after clicking button

**Fix:**
```bash
# Check .env file
cat server/.env | grep GEMINI_API_KEY

# Verify key format
echo "AIzaSyDNLYmZ8Kd0KhMOqNYL0jMGJMFMFS3vaC8"  # Should match your key
```

If key is wrong:
```bash
# Update .env with correct key
nano server/.env
# Find GEMINI_API_KEY and update
```

---

### 4. **No JWT Token**
**Symptom:** Error when clicking button without being logged in

**Fix:**
- Make sure you're **logged in** first
- Use Google or GitHub OAuth to log in
- The JWT token is stored in cookies automatically

---

### 5. **No Expenses Created**
**Symptom:** KB build succeeds, but verdict shows "No facts"

**Fix:**
- Create at least 3-5 test expenses first
- Go to Expenses section
- Click "Add Expense"
- Fill in amount, category, merchant, date
- Click Save
- Repeat 4-5 times

Then build KB again.

---

## 🧪 Testing Checklist

### Before Getting Verdict

- [ ] You are **logged in** (can see your profile)
- [ ] You have **created 3+ expenses** (visible in Expenses section)
- [ ] **ML Service is running** (`curl http://localhost:8000/health` returns JSON)
- [ ] **Backend is running** (`curl http://localhost:5000/health` returns JSON)
- [ ] **Knowledge base is built** (`ls server/knowledgebase/<userId>/` shows files)

### If All Checks Pass

Then try:
```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"question": "Why am I overspending?"}'
```

Should return:
```json
{
  "verdict": "Your analysis here...",
  "factsUsed": ["Expense fact 1", "Expense fact 2"],
  "question": "Why am I overspending?"
}
```

---

## 🚨 Emergency Restart

If nothing works, restart everything:

```bash
# Kill all services
killall node
killall python

# Restart ML Service (Terminal 1)
cd /ml && source venv/bin/activate
python -m uvicorn app:app --port 8000 --reload

# Restart Backend (Terminal 2)
cd /server
npm run dev

# Restart Frontend (Terminal 3)
cd /client
npm run dev
```

Then:
1. Login again
2. Create expenses
3. Click "Analyze my spending"

---

## 📊 Service Status Check

### ML Service
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

### Backend
```bash
curl http://localhost:5000/health
# Expected: {"status":"healthy","db":"connected"}
```

### Frontend
```bash
# Just visit http://localhost:3000
# Check browser console (F12) for errors
```

---

## 💡 Common Solutions

### Solution 1: Build KB First
```bash
# Login, create expenses, then:
curl -X POST http://localhost:5000/api/ai/build \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{}'

# Wait 30 seconds, then try verdict
```

### Solution 2: Restart ML Service
```bash
# Stop: Ctrl+C in ML Service terminal
# Restart:
cd /ml && source venv/bin/activate
python -m uvicorn app:app --port 8000 --reload
```

### Solution 3: Check Logs
```bash
# Backend logs - look for errors
# Terminal 2 output

# ML Service logs
# Terminal 1 output

# Frontend logs
# Browser F12 → Console tab
```

### Solution 4: Verify Configuration
```bash
# Check Gemini API key
grep GEMINI_API_KEY server/.env

# Check MongoDB
# Should show: {"status":"healthy","db":"connected"}
curl http://localhost:5000/health
```

---

## 🔄 Simple Test Flow

```
1. Open http://localhost:3000
   ↓
2. Click Google/GitHub login
   ↓
3. You're logged in ✅
   ↓
4. Go to Expenses section
   ↓
5. Click "Add Expense"
   ↓
6. Fill: ₹500, Food, Zomato, today
   ↓
7. Click Save
   ↓
8. Repeat steps 5-7 for 3-5 expenses
   ↓
9. Go to Dashboard
   ↓
10. See "🤖 AI Verdict" card
   ↓
11. Click "Analyze my spending"
   ↓
12. Wait 3-4 seconds
   ↓
13. See verdict appear! ✨
```

---

## 📞 Still Having Issues?

### Check These Logs

**Terminal 1 (ML Service):**
- Look for error messages
- Should show "Application startup complete"

**Terminal 2 (Backend):**
- Look for "MongoDB connected"
- Look for error messages when you click button

**Terminal 3 (Frontend):**
- Look for build errors
- Check browser console (F12)

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "No knowledge base found" | Haven't built KB | Run `/api/ai/build` endpoint |
| "ML service unavailable" | ML service down | Restart ML service |
| "Gemini API unavailable" | Invalid API key | Check GEMINI_API_KEY in .env |
| "No token provided" | Not logged in | Login via OAuth |
| "<!DOCTYPE" | Server error | Check all 3 service logs |

---

## 🎯 Quick Fixes by Scenario

### Scenario 1: Just installed, nothing works
```bash
# 1. Make sure venv is activated
cd /ml && source venv/bin/activate

# 2. Restart all services
# Ctrl+C in all terminals, then:

# Terminal 1:
python -m uvicorn app:app --port 8000 --reload

# Terminal 2:
cd /server && npm run dev

# Terminal 3:
cd /client && npm run dev

# 3. Login and test
```

### Scenario 2: Got auth token, no expenses
```bash
# 1. Create 5 test expenses via UI
# 2. Then try "Analyze my spending"
```

### Scenario 3: Expenses exist, KB not built
```bash
# 1. Call /api/ai/build endpoint
# 2. Wait 30 seconds
# 3. Check server/knowledgebase/<userId>/ for files
# 4. Try verdict endpoint
```

### Scenario 4: KB exists, getting "<! DOCTYPE" error
```bash
# 1. Check ML service running: curl http://localhost:8000/health
# 2. Check Gemini key: grep GEMINI_API_KEY server/.env
# 3. Check backend logs for errors
# 4. Restart backend: npm run dev
```

---

## ✅ Success Indicators

You'll know it's working when:

✅ `/health` endpoints return JSON  
✅ `/api/ai/build` returns 202 Accepted  
✅ Knowledge base files exist in disk  
✅ `/api/ai/verdict` returns verdict JSON (not HTML)  
✅ Frontend displays verdict in blue card  

---

## 🎉 If Still Stuck

Follow this exact sequence:

1. Restart all 3 services (Ctrl+C, then run again)
2. Login with Google OAuth
3. Create 5 test expenses
4. Open browser Network tab (F12 → Network)
5. Click "Analyze my spending"
6. Look at request/response in Network tab
7. Check if response is JSON or HTML
8. If HTML, note the error message
9. Check backend logs for matching error
10. Fix based on error message

---

**Most common fix:** Build knowledge base first, then try verdict! 🎯

See SETUP_COMPLETE.md for full instructions.
