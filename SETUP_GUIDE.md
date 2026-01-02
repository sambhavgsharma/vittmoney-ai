# Quick Setup Guide - Post-Migration

## What Changed?
✅ **Gemini → HuggingFace Mistral** as primary AI service
✅ **Three-tier fallback** for reliability
✅ **No more quota errors** - HF free tier is generous
✅ **All systems improved** - email, currency, validation

---

## 3 Steps to Get Running

### Step 1: Get HuggingFace API Token (2 minutes)
```
1. Go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Name it: "vittmoney-ai"
4. Select: "Read" access
5. Click "Generate"
6. Copy the token (starts with hf_)
```

### Step 2: Set Environment Variables on Render (3 minutes)
```
1. Go to: https://dashboard.render.com
2. Click your "vittmoney-ai" backend service
3. Click "Settings"
4. Scroll to "Environment Variables"
5. Add these variables:

   HF_API_KEY = [Paste your token from Step 1]
   HF_MODEL = mistralai/Mistral-7B-Instruct-v0.2
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASSWORD = [Gmail app password]

6. Click "Save"
7. Service auto-redeploys (watch the Logs tab)
```

### Step 3: Test It (1 minute)
```
1. Open your app: https://vittmoney-ai.vercel.app (or your URL)
2. Add a test expense
3. Ask the AI a question about your spending
4. Should see response from Mistral!

Check logs in Render:
- Should see: "🔄 Calling HuggingFace API with model: mistralai/Mistral-7B-Instruct-v0.2..."
- Should see: "✅ HuggingFace API response received"
```

---

## If Something Goes Wrong

### "HuggingFace API Error"
- ❌ HF_API_KEY is wrong or missing
- ✅ Go back to Step 1, copy the token again carefully
- ✅ Make sure you copied the WHOLE token

### "HuggingFace Model not found"
- ❌ HF_MODEL is misspelled
- ✅ Check it's exactly: `mistralai/Mistral-7B-Instruct-v0.2`
- ✅ No extra spaces or capital letters

### "Still getting local analysis"
- ✅ That's actually fine! Local fallback means HF didn't respond
- ✅ Check Render logs for errors
- ✅ Wait 1 minute after deploying - HF server might still be loading

### "Email not sending"
- ❌ EMAIL_USER or EMAIL_PASSWORD is wrong
- ✅ Go to https://myaccount.google.com/apppasswords
- ✅ Make sure you're using App Password, NOT your regular Google password
- ✅ Requires 2FA enabled on Google account

---

## Verification Checklist

- [ ] HF_API_KEY is set and starts with `hf_`
- [ ] HF_MODEL is exactly `mistralai/Mistral-7B-Instruct-v0.2`
- [ ] EMAIL_USER is your Gmail address
- [ ] EMAIL_PASSWORD is from Google App Passwords (not regular password)
- [ ] Render shows "Build finished" in Logs
- [ ] No errors in Render Logs
- [ ] Can add expenses in the app
- [ ] AI responds to questions

---

## Architecture Overview

```
User Question
    ↓
AI Verdict Endpoint
    ↓
Primary: HuggingFace Mistral API
    ↓ (fails → tries next)
Secondary: Gemini API (optional, disabled)
    ↓ (fails → tries next)
Tertiary: Local Analysis (always works)
    ↓
Response sent to user
```

**Result:** System NEVER fails. Always has working fallback.

---

## What You Get

✅ **AI-Powered Insights**
- Uses Mistral AI to analyze your spending
- Understands your patterns
- Gives personalized suggestions

✅ **Reliable Email Delivery**
- Contact forms work
- Confirmation emails sent
- Error messages are clear

✅ **Currency Support**
- Settings → Preferences → Pick your currency
- INR, USD, EUR, GBP, JPY supported
- All amounts display in your currency

✅ **Safe Amount Entry**
- Max: 99,999,999
- Prevents typos and overflow
- Shows formatted preview as you type

✅ **Smart Classification**
- AI categorizes expenses
- Works offline too
- Fallback to local when API unavailable

---

## Need Help?

Check these logs:
1. **Render Backend Logs**: Dashboard → Logs (shows all errors)
2. **Browser Console**: F12 → Console tab (frontend errors)
3. **Network Tab**: F12 → Network (check API calls)

---

**Everything should now be production-ready!** 🚀
