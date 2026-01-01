# VittMoney AI - Quick Start Deployment Guide

## 🚀 5-Minute Quick Reference

### 1. Local Testing with Docker

```bash
# Navigate to project root
cd /home/jon-snow/Tech/Projects/vittmoney-ai

# Build and start services
docker-compose up --build

# Services running at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: mongodb://localhost:27017
```

### 2. Quick Health Check

```bash
# Check backend is healthy
curl http://localhost:5000/health

# Expected response:
# {"status":"healthy","db":"connected"}
```

### 3. Environment Setup

```bash
# Copy templates
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Edit with your values:
# - MongoDB URI (from MongoDB Atlas)
# - OAuth credentials (Google & GitHub)
# - JWT secret (random string)
# - Domain URLs (for production)
```

### 4. Deploy to Render (Easiest)

**Backend:**
1. Connect GitHub repo
2. Select `server` as root directory
3. Add environment variables from `server/.env`
4. Deploy

**Frontend:**
1. Connect GitHub repo  
2. Select `client` as root directory
3. Add environment variables from `client/.env.example`
4. Deploy

### 5. Post-Deployment

```bash
# Test health endpoint
curl https://your-backend-url/health

# Test frontend
open https://your-frontend-url

# Verify OAuth works
# Try signing in with Google/GitHub
```

---

## 📁 Key Files Created

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Complete deployment guide (2500+ lines) |
| `DEPLOYMENT_CHECKLIST.md` | Pre-deployment verification checklist |
| `server/Dockerfile` | Production Docker image for backend |
| `client/Dockerfile` | Production Docker image for frontend |
| `docker-compose.yml` | Local dev environment with all services |
| `server/.env.example` | Backend environment template |
| `client/.env.example` | Frontend environment template |
| `server/.dockerignore` | Docker build optimization |
| `client/.dockerignore` | Docker build optimization |

---

## ⚙️ Critical Environment Variables

### Backend (Required)

```env
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://yourdomain.com
MONGO_URI=mongodb+srv://user:pass@...
JWT_SECRET=<random-32-char-string>
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

### Frontend (Required)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
NEXT_PUBLIC_GITHUB_CLIENT_ID=xxx
```

---

## 🔑 Where to Get Credentials

| Service | URL |
|---------|-----|
| MongoDB | https://www.mongodb.com/cloud/atlas |
| Google OAuth | https://console.cloud.google.com/ |
| GitHub OAuth | https://github.com/settings/developers |

---

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Remove everything
docker-compose down -v
```

---

## 🧪 Local Testing

```bash
# Test backend
curl http://localhost:5000/
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000

# Test MongoDB (from container)
docker exec -it vittmoney-mongodb mongosh

# Test API registration
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

---

## ✅ Pre-Deployment Checklist

- [ ] Local docker-compose test passes
- [ ] Health endpoint responds
- [ ] MongoDB Atlas configured
- [ ] OAuth credentials obtained
- [ ] .env files created (not committed)
- [ ] JWT_SECRET is strong (32+ chars)
- [ ] Deployment platform selected
- [ ] GitHub repo is public/accessible
- [ ] All environment variables ready
- [ ] Review DEPLOYMENT.md guide

---

## 🆘 Common Issues & Fixes

### "Can't connect to MongoDB"
```bash
# Check MongoDB Atlas
# 1. Verify IP whitelist includes deployment server
# 2. Check username/password in MONGO_URI
# 3. Ensure database user has correct permissions
```

### "CORS error"
```bash
# Update SERVER's CLIENT_ORIGIN to match frontend URL
# Example: https://yourdomain.com
```

### "OAuth redirect mismatch"
```bash
# Update Google/GitHub OAuth settings
# Callback URL must be exact:
# https://your-backend-url/api/auth/google/callback
```

### "Build fails"
```bash
# Check Node version: node --version (should be 18+)
# Clear cache: npm cache clean --force
# Delete node_modules and reinstall
```

---

## 📊 Architecture

```
Frontend (Next.js)          Backend (Express)          Database (MongoDB)
  :3000                       :5000                      Atlas Cloud
    │                           │                            │
    ├──────── API Calls ────────┤                            │
    │                           ├──── Read/Write ───────────┤
    │                           │
    └─── OAuth Redirect ────────┘
```

---

## 🚀 Deployment Platforms

### Tier 1: Easiest (Recommended)
- **Render** - Best all-in-one for full-stack
- **Railway** - Easy environment management

### Tier 2: Moderate
- **DigitalOcean App Platform** - Good balance
- **Vercel + Firebase** - Frontend + Serverless

### Tier 3: Powerful (Requires More Setup)
- **AWS (ECS/EC2)** - Maximum control
- **Kubernetes** - Enterprise scaling

---

## 📈 Next Steps

1. **Review** `DEPLOYMENT.md` for full details
2. **Test** locally with `docker-compose up`
3. **Choose** deployment platform
4. **Configure** environment variables
5. **Deploy** to production
6. **Monitor** health and logs
7. **Scale** as needed

---

## 📞 Support

**Issue?** Check these in order:
1. `DEPLOYMENT.md` → Troubleshooting
2. Check service logs: `docker-compose logs`
3. Verify environment variables
4. Test endpoints with curl
5. Check health endpoint status

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Local Docker test | 5 min |
| Render setup | 15 min |
| Railway setup | 15 min |
| AWS setup | 30 min |
| Post-deployment verify | 10 min |
| **Total** | **~1 hour** |

---

**Last Updated:** December 31, 2025  
**Version:** 1.0 - Production Ready
