# VittMoney AI - Deployment Guide

> Complete instructions for deploying VittMoney AI to production

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Local Docker Testing](#local-docker-testing)
4. [Deployment Platforms](#deployment-platforms)
   - [Render](#render)
   - [Railway](#railway)
   - [AWS](#aws)
   - [DigitalOcean](#digitalocean)
5. [Database Setup](#database-setup)
6. [OAuth Configuration](#oauth-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] MongoDB Atlas cluster is set up
- [ ] Google OAuth credentials are obtained
- [ ] GitHub OAuth credentials are obtained
- [ ] Email service (Gmail/SendGrid) is configured
- [ ] Frontend and backend build successfully locally
- [ ] All tests pass (if applicable)
- [ ] `.env` files are added to `.gitignore`
- [ ] No hardcoded secrets in the codebase
- [ ] `NODE_ENV` is set to `production` in server
- [ ] CORS origin is set to production domain

---

## Environment Variables Setup

### Server (.env)

Copy `server/.env.example` to `server/.env` and fill in:

```bash
# Critical for production
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://yourdomain.com
JWT_SECRET=<generate-strong-32-char-random-string>

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vittmoney?retryWrites=true&w=majority

# OAuth
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
GOOGLE_CALLBACK_URL=https://your-backend-url/api/auth/google/callback

GITHUB_CLIENT_ID=<from-github-settings>
GITHUB_CLIENT_SECRET=<from-github-settings>
GITHUB_CALLBACK_URL=https://your-backend-url/api/auth/github/callback

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<app-specific-password>
ACCT_EMAIL_ID=your-email@gmail.com
```

### Client (.env.local)

Copy `client/.env.example` to `client/.env.local` and fill in:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same-as-backend>
NEXT_PUBLIC_GITHUB_CLIENT_ID=<same-as-backend>
```

---

## Local Docker Testing

Test your Docker setup before deploying:

### 1. Build Images

```bash
cd server
docker build -t vittmoney-backend .

cd ../client
docker build -t vittmoney-frontend .
```

### 2. Run with Docker Compose

```bash
# Create .env file in project root with OAuth secrets
cp server/.env.example .env.local

# Start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - MongoDB: mongodb://localhost:27017
```

### 3. Test Endpoints

```bash
# Test backend health
curl http://localhost:5000/health

# Test backend API
curl http://localhost:5000/

# Test frontend
curl http://localhost:3000
```

### 4. View Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 5. Stop Services

```bash
docker-compose down
# Remove volumes: docker-compose down -v
```

---

## Deployment Platforms

### Render

#### Backend Deployment

1. **Create Web Service**
   - Connect GitHub repository
   - Select `server` as root directory
   - Build command: `npm install`
   - Start command: `npm start`

2. **Add Environment Variables**
   - Go to Service Settings → Environment
   - Add all variables from `server/.env.example`
   - Set `NODE_ENV=production`

3. **Add MongoDB**
   - Use MongoDB Atlas (external service)
   - Connect string: `mongodb+srv://...`

4. **Configure Health Checks**
   - Health check path: `/health`
   - Poll every: 30 seconds

#### Frontend Deployment

1. **Create Static Site**
   - Connect GitHub repository
   - Build command: `cd client && npm run build`
   - Publish directory: `client/.out` (or `.next` for SSR)

2. **Add Environment Variables**
   - `NEXT_PUBLIC_API_URL=<backend-url>`
   - `NEXT_PUBLIC_API_BASE_URL=<backend-url>/api`

3. **Custom Domain**
   - Add custom domain in settings
   - Update `CLIENT_ORIGIN` in backend

### Railway

#### Backend Deployment

1. **Create New Project**
   - Connect GitHub repo
   - Select `server` directory

2. **Configure Build**
   - Railway auto-detects Node.js
   - Build command: `npm install`
   - Start command: `npm start`

3. **Environment Variables**
   - Add all from `server/.env.example`

4. **Generate URL**
   - Use Railway's generated URL for `CLIENT_ORIGIN`

#### Frontend Deployment

1. **Create New Service**
   - Select Next.js
   - Root directory: `client`

2. **Environment Setup**
   - `NEXT_PUBLIC_API_URL=<railway-backend-url>`

### AWS

#### Option 1: EC2 + Docker

```bash
# SSH into instance
ssh -i key.pem ubuntu@instance-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repo and deploy
git clone <repo-url>
cd vittmoney-ai
docker-compose up -d
```

#### Option 2: ECS (Fargate)

1. Create ECR repositories for backend and frontend
2. Push Docker images
3. Create ECS cluster
4. Create services with Fargate launch type
5. Configure load balancer

#### Option 3: Amplify (Frontend Only)

1. Connect GitHub repo
2. Configure build settings
3. Add environment variables
4. Deploy

### DigitalOcean

#### App Platform

1. **Connect GitHub**
   - Select repository
   - Choose branch

2. **Configure Services**
   - Backend service: Node.js
   - Frontend service: Next.js
   - Database: MongoDB (external Atlas)

3. **Environment Variables**
   - Configure for both services

4. **Deploy**
   - DigitalOcean auto-builds and deploys

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up or log in

2. **Create Cluster**
   - Click "Create Deployment"
   - Choose shared (free) or dedicated tier
   - Select region close to your app
   - Click "Create Deployment"

3. **Get Connection String**
   - Click "Connect" button
   - Choose "Drivers"
   - Copy connection string
   - Replace `<username>` and `<password>`

4. **Add IP Whitelist**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" for development
   - Restrict to specific IPs in production

5. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Set admin role (can be restricted later)

---

## OAuth Configuration

### Google OAuth

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/

2. **Create Project**
   - Click "Select a Project" → "New Project"
   - Enter project name: "VittMoney AI"

3. **Enable OAuth 2.0**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (then Internal later)
   - Fill in app information

4. **Create OAuth Credentials**
   - Go to "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - `https://your-backend-url/api/auth/google/callback`
   - Copy Client ID and Secret

### GitHub OAuth

1. **Go to GitHub Settings**
   - https://github.com/settings/developers

2. **Create OAuth App**
   - Click "New OAuth App"
   - Fill in details:
     - Application name: "VittMoney AI"
     - Homepage URL: `https://yourdomain.com`
     - Authorization callback URL: `https://your-backend-url/api/auth/github/callback`

3. **Get Credentials**
   - Copy Client ID and generate Client Secret

---

## Post-Deployment Verification

### 1. Test API Endpoints

```bash
# Health check
curl https://your-backend-url/health

# API root
curl https://your-backend-url/

# Try registration (without credentials)
curl -X POST https://your-backend-url/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!"}'
```

### 2. Test Frontend

- Visit `https://yourdomain.com`
- Check console for errors
- Try logging in with OAuth providers
- Verify API calls reach backend

### 3. Test OAuth Flow

- Click "Sign in with Google"
- Verify redirect works
- Check JWT token in localStorage

### 4. Test Database Connection

- Create a user through registration
- Check MongoDB Atlas to verify data was saved
- Query collections to ensure data integrity

---

## Monitoring & Logging

### Backend Monitoring

```bash
# View logs
docker logs vittmoney-backend

# Or on Render/Railway, use their dashboard

# Monitor health endpoint
watch -n 5 "curl https://your-backend-url/health"
```

### Database Monitoring

- MongoDB Atlas dashboard shows:
  - Query performance
  - Storage usage
  - Connection count
  - Network traffic

### Frontend Monitoring

- Check browser console for errors
- Monitor API calls in Network tab
- Use Sentry or similar for error tracking

### Recommended Tools

- **Error Tracking**: Sentry
- **Logging**: LogRocket, Datadog
- **Monitoring**: Grafana, New Relic
- **Uptime Monitoring**: Uptime Robot, Pingdom

---

## Troubleshooting

### Common Issues

#### MongoDB Connection Error

```
Error: MongoDB connection error: ECONNREFUSED
```

**Solution:**
- Verify `MONGO_URI` is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct password
- Test connection string with MongoDB Compass

#### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Check `CLIENT_ORIGIN` environment variable
- Ensure it matches frontend URL exactly
- Verify CORS middleware in `server/index.js`

#### OAuth Redirect Error

```
Error: redirect_uri_mismatch
```

**Solution:**
- Verify redirect URL in Google/GitHub console
- Must match exactly: `https://your-backend-url/api/auth/google/callback`
- No trailing slashes or extra parameters

#### Build Failure

```
npm ERR! code ELIFECYCLE
```

**Solution:**
- Check Node.js version matches (should be 20+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

#### JWT Token Issues

```
Error: jwt malformed
```

**Solution:**
- Ensure `JWT_SECRET` is set in environment
- Check token is being sent in Authorization header
- Verify token hasn't expired

### Getting Help

1. Check application logs
2. Review `.env` configuration
3. Test endpoints with curl/Postman
4. Check MongoDB connection
5. Verify OAuth credentials
6. Review browser console for frontend errors

---

## Security Checklist

- [ ] All secrets in `.env` (never in code)
- [ ] HTTPS enabled on all endpoints
- [ ] CORS restricted to your domain
- [ ] JWT secret is strong (32+ characters)
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive info
- [ ] Dependencies regularly updated
- [ ] Environment-specific configs used
- [ ] Admin routes protected
- [ ] File upload restrictions in place

---

## Performance Optimization

1. **Frontend**
   - Enable Next.js image optimization
   - Use code splitting
   - Enable gzip compression
   - Cache static assets

2. **Backend**
   - Add database indexes
   - Cache frequent queries
   - Implement rate limiting
   - Use connection pooling

3. **Database**
   - Create indexes on frequently queried fields
   - Enable compression
   - Regular backups
   - Monitor slow queries

4. **Deployment**
   - Use CDN for static assets
   - Enable caching headers
   - Use load balancing
   - Monitor performance metrics

---

## Scaling Guide

As your application grows:

1. **Database Scaling**
   - Move from shared cluster to dedicated
   - Enable sharding
   - Use read replicas

2. **Backend Scaling**
   - Horizontal scaling with load balancer
   - Session store (Redis)
   - Queue system (Bull, RabbitMQ)

3. **Frontend Scaling**
   - CDN distribution (CloudFlare, AWS CloudFront)
   - Static site generation
   - API caching

4. **Infrastructure**
   - Use Kubernetes for orchestration
   - Auto-scaling groups
   - Database replication
   - Multi-region deployment

---

## Support

For issues or questions:
1. Check logs first
2. Review environment variables
3. Test with curl/Postman
4. Check MongoDB connection
5. Verify OAuth setup
6. Review browser console

Last updated: December 31, 2025
