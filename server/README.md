# Vittmoney AI - Backend Server

> **Node.js/Express API for AI-Powered Financial Management**
>
> RESTful backend providing authentication, expense management, AI insights, and integration with ML services for intelligent financial analysis.

---

## ✨ Features

### Core Functionality
- **RESTful API**: Express.js with structured routing
- **Expense Management**: Create, read, update, delete expense records
- **User Accounts**: User registration and profile management
- **Authentication**: JWT-based with OAuth (GitHub, Google)
- **AI Insights**: AI-powered spending analysis using RAG pattern
- **Knowledge Base**: Automatic generation and management of user-specific knowledge bases

### Advanced Features
- **Google Gemini Integration**: LLM-powered financial insights
- **ML Service Integration**: Semantic search with embeddings
- **Scheduled Jobs**: Background knowledge base building
- **File Uploads**: Multer for handling receipts/documents
- **Email Notifications**: Nodemailer for alerts and updates
- **CORS Support**: Cross-origin requests for frontend integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key
- GitHub OAuth credentials (optional)
- Google OAuth credentials (optional)
- ML Service running on port 5000

### Installation

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Setup

Create `.env` in the server directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/vittmoney

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY=7d

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-app-id
GITHUB_CLIENT_SECRET=your-github-app-secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# AI & ML Services
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key
ML_SERVICE_URL=http://localhost:5000

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### Running the Server

**Development Mode** (with Nodemon):
```bash
npm run dev
```
- Server runs on `http://localhost:3001`
- Auto-restarts on file changes

**Production Mode**:
```bash
npm start
```

**Build Knowledge Base** (One-time or scheduled):
```bash
node jobs/buildKnowledgebase.js
```

---

## 📁 Project Structure

```
server/
├── auth/
│   ├── github.js              # GitHub OAuth strategy
│   └── google.js              # Google OAuth strategy
│
├── middleware/
│   ├── auth.js                # JWT verification middleware
│   └── errorHandler.js        # Global error handling
│
├── routes/
│   ├── auth.js                # Authentication endpoints
│   ├── users.js               # User management endpoints
│   ├── expenses.js            # Expense CRUD endpoints
│   ├── ai.js                  # AI analysis endpoints
│   └── health.js              # Health check endpoints
│
├── services/
│   ├── llmService.js          # Google Gemini wrapper
│   ├── mlService.js           # ML service integration
│   ├── userService.js         # User business logic
│   ├── expenseService.js      # Expense business logic
│   └── knowledgebaseService.js # Knowledge base management
│
├── jobs/
│   └── buildKnowledgebase.js  # Knowledge base generation job
│
├── Models/
│   ├── User.js                # User schema
│   ├── Expense.js             # Expense schema
│   └── KnowledgeBase.js       # Knowledge base metadata (optional)
│
├── knowledgebase/
│   └── {userId}/              # Per-user knowledge base directories
│       └── knowledge_base.json # User's stored facts & embeddings
│
├── uploads/                   # Uploaded files storage
├── utils/
│   ├── logger.js              # Logging utility
│   └── helpers.js             # Helper functions
│
├── index.js                   # Express app entry point
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

---

## 🔑 API Endpoints

### Authentication

#### POST `/auth/register`
Register a new user with email and password.

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

#### POST `/auth/login`
Login with email and password.

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

#### GET `/auth/github`
OAuth login via GitHub.

#### GET `/auth/google`
OAuth login via Google.

### Expenses

#### GET `/api/expenses`
Get all expenses for authenticated user.

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "expenses": [
    {
      "id": "expense-id",
      "amount": 420,
      "category": "Food",
      "merchant": "Zomato",
      "date": "2025-12-29",
      "description": "Lunch delivery"
    }
  ]
}
```

#### POST `/api/expenses`
Create a new expense.

```bash
curl -X POST http://localhost:3001/api/expenses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 420,
    "category": "Food",
    "merchant": "Zomato",
    "date": "2025-12-29",
    "description": "Lunch delivery"
  }'
```

#### PUT `/api/expenses/:id`
Update an expense.

#### DELETE `/api/expenses/:id`
Delete an expense.

### AI Insights

#### POST `/api/ai/verdict`
Get AI-powered spending insights.

```bash
curl -X POST http://localhost:3001/api/ai/verdict \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How can I reduce my food expenses?"
  }'
```

Response:
```json
{
  "success": true,
  "verdict": "Based on your spending data, you spent ₹1,370 on food this week. Consider cooking at home 2-3x weekly to reduce expenses by ~40%.",
  "factsUsed": [
    "₹420 spent on Food at Zomato on 2025-12-29",
    "₹650 spent on Food at Swiggy on 2025-12-28",
    "₹300 spent on Food at local restaurant on 2025-12-27"
  ],
  "question": "How can I reduce my food expenses?"
}
```

### Health & Status

#### GET `/api/health`
Check server health.

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-29T10:30:00Z"
}
```

---

## 🧠 Knowledge Base System

### How It Works

1. **Knowledge Base Building** (`buildKnowledgebase.js`)
   - Fetches all user expenses from MongoDB
   - Converts expenses to facts: "₹420 spent on Food at Zomato on 2025-12-29"
   - Sends facts batch to ML service for embeddings
   - Stores embeddings + facts in per-user knowledge base files

2. **Similarity Search** (Used in `/api/ai/verdict`)
   - User query is embedded via ML service
   - L2 distance calculated between query embedding and stored fact embeddings
   - Top 5 most similar facts are retrieved
   - Facts sent to LLM with the original query

3. **File Structure**
```
knowledgebase/
└── {userId}/
    └── knowledge_base.json
        {
          "facts": ["₹420 spent on Food...", "₹650 spent on Food..."],
          "embeddings": [[0.1, 0.2, ...], [0.3, 0.4, ...]],
          "lastUpdated": "2025-12-29T10:00:00Z"
        }
```

### Running Knowledge Base Job

**Manual Execution**:
```bash
node jobs/buildKnowledgebase.js
```

**Scheduled (Example - Every 6 hours)**:
```bash
# Using a cron job scheduler (node-cron)
0 */6 * * * cd /path/to/server && node jobs/buildKnowledgebase.js
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Token-based authentication |
| **Passport.js** | OAuth authentication |
| **Google Generative AI** | LLM for insights |
| **Nodemailer** | Email sending |
| **Multer** | File upload handling |
| **bcryptjs** | Password hashing |
| **dotenv** | Environment variables |
| **axios** | HTTP client |
| **CORS** | Cross-origin support |

---

## 🔐 Security Features

- **JWT Tokens**: Secure session management
- **Password Hashing**: bcryptjs with salt rounds
- **CORS**: Configured for frontend origin
- **Environment Variables**: Sensitive data in .env
- **Input Validation**: Request validation on all routes
- **Error Handling**: Generic error messages to prevent info leakage
- **SQL/NoSQL Injection Prevention**: Mongoose with schema validation

---

## 🔄 Development Workflow

### Running in Development
```bash
npm run dev
```

### Testing Authentication
```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'

# Login and get token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'
```

### Testing with Mock Data
```bash
# Create sample expenses
node scripts/seed-data.js
```

---

## 📚 Database Schemas

### User Schema
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  avatar: String,
  oauthId: String,
  oauthProvider: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  amount: Number,
  category: String,
  merchant: String,
  date: Date,
  description: String,
  receipt: String (file path),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh # or mongo

# If not running, start it
mongod
```

### Port Already in Use
```bash
# Find process on port 3001
lsof -i :3001
# Kill it
kill -9 <PID>
```

### Knowledge Base Build Fails
```bash
# Check ML service is running
curl http://localhost:5000/health

# Check MongoDB has data
db.expenses.countDocuments()

# Run with debugging
DEBUG=* node jobs/buildKnowledgebase.js
```

### JWT Errors
```bash
# Regenerate secret in .env
JWT_SECRET=$(openssl rand -base64 32)
```

---

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t vittmoney-server .

# Run container
docker run -p 3001:3001 \
  -e MONGODB_URI=mongodb://... \
  -e JWT_SECRET=... \
  vittmoney-server
```

### Production Considerations
- Use environment variables from CI/CD
- Enable HTTPS only in production
- Configure proper CORS origins
- Set up MongoDB backups
- Enable request rate limiting
- Monitor logs and errors

---

## 📊 API Response Format

All API responses follow this structure:

**Success**:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

**Error**:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## 🤝 Contributing

1. Follow existing code patterns
2. Use proper error handling
3. Add comments for complex logic
4. Test endpoints before pushing
5. Update documentation

---

## 📝 Logging

The server includes logging for:
- Authentication events
- API requests/responses
- Database operations
- Errors and exceptions

View logs:
```bash
tail -f server.log
```

---

**Built with ❤️ using Express.js**
