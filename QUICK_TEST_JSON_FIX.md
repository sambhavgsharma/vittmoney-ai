# 🚀 Quick Test: Fix "Unexpected Token '<'" Error

## The Issue
Frontend shows: `Unexpected token '<', "<!DOCTYPE "...` 

This happens when backend returns HTML instead of JSON.

---

## ⚡ 60-Second Fix

### Step 1: Verify All Services (30 seconds)
```bash
# Terminal 1: Check ML Service
curl http://localhost:8000/health
# Should see: {"status":"healthy"}

# Terminal 2: Check Backend
curl http://localhost:5000/health
# Should see: {"status":"healthy","db":"connected"}

# Terminal 3: Check Frontend
# Visit http://localhost:3000 in browser
# Should load without errors
```

**If any fails:** Restart that service (see Step 4)

---

### Step 2: Login & Create Expenses (30 seconds)
```
1. Go to http://localhost:3000
2. Click "Login with Google" or "Login with GitHub"
3. You're logged in ✅
4. Go to "Expenses" in sidebar
5. Click "Add Expense"
6. Fill in:
   - Amount: 500
   - Category: Food
   - Merchant: Zomato
   - Date: Today
7. Click Save
8. Repeat 4 more times (total: 5 expenses)
```

---

### Step 3: Build Knowledge Base
```bash
# Copy your JWT token from browser:
# F12 → Application → Cookies → find token value

# Replace <TOKEN> with actual token:
curl -X POST http://localhost:5000/api/ai/build \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'

# Response: 202 Accepted (or 201 if already built)
# This triggers knowledge base building in background
```

**Wait 10-30 seconds** for KB to build.

---

### Step 4: Test Verdict Endpoint
```bash
# Same TOKEN as above:
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"question": "Why am I overspending?"}'

# Should return JSON like:
# {
#   "verdict": "Your answer here...",
#   "factsUsed": ["expense 1", "expense 2"],
#   "question": "Why am I overspending?"
# }
```

✅ **If you see verdict JSON, the backend is fixed!**

---

### Step 5: Test Frontend UI
```
1. Refresh http://localhost:3000
2. Login if needed
3. Go to Dashboard (should be default page)
4. Scroll down to "🤖 AI Verdict" card
5. Click "Analyze my spending"
6. Wait 3-4 seconds
7. Should see verdict in blue box
```

✅ **If verdict appears, you're done!**

---

## 🆘 If Something Failed

### Issue: curl shows `<!DOCTYPE` error
**Solution:** Your service(s) are down

```bash
# Kill any stuck processes
killall node
killall python

# Restart all services:

# Terminal 1 (ML Service):
cd /ml && source venv/bin/activate
python -m uvicorn app:app --port 8000 --reload

# Terminal 2 (Backend):
cd /server && npm run dev

# Terminal 3 (Frontend):
cd /client && npm run dev

# Wait 5 seconds, then retry Step 1
```

---

### Issue: curl shows `{"error":"No token provided"}`
**Solution:** You need to be logged in

```bash
1. Go to http://localhost:3000
2. Click Login button
3. Complete Google/GitHub OAuth
4. Go back to terminal, get new token from browser
5. Try curl command again with new token
```

---

### Issue: curl shows `{"message":"No knowledge base found"}`
**Solution:** Build KB first (Step 3)

```bash
# Run this with your JWT token:
curl -X POST http://localhost:5000/api/ai/build \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{}'

# Wait 20 seconds
# Try verdict endpoint again
```

---

### Issue: curl shows service error (503)
**Solution:** Services are not responding correctly

```bash
# Check each service:

# ML Service:
curl http://localhost:8000/health
# Should return: {"status":"healthy"}

# Backend:
curl http://localhost:5000/health
# Should return: {"status":"healthy","db":"connected"}

# If either fails, see "If Something Failed" section above
```

---

## 🎯 The Working Flow (All Steps)

```
✅ All 3 services running
  ↓
✅ Logged in (have JWT token)
  ↓
✅ Created 5+ expenses
  ↓
✅ Built knowledge base (202 response)
  ↓
✅ Verdict endpoint returns JSON (not HTML)
  ↓
✅ Frontend displays verdict 🎉
```

---

## 🔍 Debugging With Browser

If frontend still shows error:

1. Open http://localhost:3000
2. Press **F12** (Developer Tools)
3. Go to **Network** tab
4. Click "Analyze my spending" button
5. Look for request to `/api/ai/verdict`
6. Click on it
7. Check **Response** tab:
   - ✅ If JSON → backend is fixed
   - ❌ If HTML → see terminal logs, restart services

---

## ⚙️ Configuration Check

```bash
# Verify Gemini API key is set
grep GEMINI_API_KEY /server/.env

# Should show something like:
# GEMINI_API_KEY=AIzaSy...abc123

# If empty or missing:
nano /server/.env
# Add: GEMINI_API_KEY=<your-actual-key>
# Ctrl+X, Y, Enter to save

# Restart backend:
cd /server && npm run dev
```

---

## ✨ Success!

When you see this in your browser:

```
🤖 AI Verdict

Your spending in Food is 45% of your budget. 
Consider reducing restaurant visits to 2-3 per week...

Facts Used: [Zomato ₹500, Swiggy ₹450, ...]
```

**You're done!** The JSON error is fixed! 🎉

---

## 📋 Checklist Before Testing

- [ ] ML Service running (`curl http://localhost:8000/health` works)
- [ ] Backend running (`curl http://localhost:5000/health` works)
- [ ] Frontend running (http://localhost:3000 loads)
- [ ] Logged in (can see profile)
- [ ] Have 5+ expenses created
- [ ] GEMINI_API_KEY is in `/server/.env`
- [ ] Backend restarted after any changes

Then run Steps 1-5 above.

**Most common issue:** Not building knowledge base before calling verdict! 👆

See the full TROUBLESHOOTING_JSON_ERROR.md for more details.
