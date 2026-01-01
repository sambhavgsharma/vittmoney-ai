# AI Feature - Environment Variables & Setup

## Required Environment Variables

### Server (.env)

```env
# Existing variables
MONGO_URI=mongodb://localhost:27017/vittmoney
CLIENT_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# NEW: AI Feature
GOOGLE_API_KEY=<your-google-generative-ai-api-key>
ML_SERVICE_URL=http://localhost:8000
```

## Getting the Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key
4. Paste into `.env` as `GOOGLE_API_KEY`

## Quick Start Commands

### Terminal 1: ML Service
```bash
cd ml
python -m uvicorn app:app --reload --port 8000
```

### Terminal 2: Backend
```bash
cd server
npm install  # If first time
npm run dev
```

### Terminal 3: Client
```bash
cd client
npm install  # If first time
npm run dev
```

### Terminal 4: Build Knowledge Base (One-time or scheduled)
```bash
cd server
node jobs/buildKnowledgebase.js
```

## Verify Setup

### Check ML Service
```bash
curl http://localhost:8000/health
# Response: {"status": "healthy"}
```

### Check Backend
```bash
curl http://localhost:5000/health
# Response: {"status": "healthy", "db": "connected"}
```

### Check Client
Open http://localhost:3000 in browser

## Troubleshooting

### "ML Service URL not reachable"
- Ensure ML service is running on port 8000
- Check `ML_SERVICE_URL` in `.env`

### "Knowledge base not found"
- Run `node server/jobs/buildKnowledgebase.js`
- Check `server/knowledgebase/` directory created

### "Invalid API Key"
- Verify `GOOGLE_API_KEY` in `.env`
- Regenerate from Google AI Studio

### "Port already in use"
```bash
# Kill process on port
lsof -ti :8000 | xargs kill -9  # ML service
lsof -ti :5000 | xargs kill -9  # Backend
lsof -ti :3000 | xargs kill -9  # Client
```

---

**Everything set up?** Navigate to Dashboard → AI Verdict card → Click "Analyze my spending"! 🚀
