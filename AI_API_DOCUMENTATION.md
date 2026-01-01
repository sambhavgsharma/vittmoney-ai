# AI Feature - API Documentation

## Overview

This document outlines all AI-related API endpoints.

## Endpoints

### 1. POST /api/ai/verdict

**Purpose**: Get AI-powered financial insights based on user expenses

**Authentication**: Required (Bearer token)

**Request**:
```http
POST /api/ai/verdict HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "question": "Why am I overspending this month?"
}
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | string | Yes | User's question about spending |

**Response** (200 OK):
```json
{
  "verdict": "Based on your spending data, here are 3 insights:\n\n1. **Food is your biggest expense** - ₹8,540 across 12 transactions...",
  "factsUsed": [
    "₹420 spent on Food at Zomato on 2025-12-29",
    "₹450 spent on Food at Swiggy on 2025-12-28",
    "₹1,200 spent on Transport via Uber on 2025-12-27",
    "₹2,100 spent on Entertainment at Netflix on 2025-12-26",
    "₹850 spent on Shopping at Amazon on 2025-12-25"
  ],
  "question": "Why am I overspending this month?"
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| verdict | string | AI-generated insights (markdown formatted) |
| factsUsed | array | Top-5 expense facts used for analysis |
| question | string | The original user question |

**Error Responses**:

404 - Knowledge base not found:
```json
{
  "message": "No knowledge base found. Please run buildKnowledgebase job first."
}
```

400 - Missing question:
```json
{
  "message": "Question is required"
}
```

500 - Server error:
```json
{
  "message": "Failed to generate verdict"
}
```

**Example Usage** (cURL):
```bash
curl -X POST http://localhost:5000/api/ai/verdict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "question": "Why am I overspending this month?"
  }'
```

**Example Usage** (JavaScript/Fetch):
```javascript
const response = await fetch('/api/ai/verdict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    question: "Why am I overspending this month?"
  })
});

const data = await response.json();
console.log(data.verdict);
```

**Example Usage** (Python/Requests):
```python
import requests

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

response = requests.post(
    'http://localhost:5000/api/ai/verdict',
    json={'question': 'Why am I overspending this month?'},
    headers=headers
)

data = response.json()
print(data['verdict'])
```

---

## Backend Endpoints (Internal)

These are used internally by the AI feature and don't need to be called directly.

### 1. POST /embed (ML Service)

**Purpose**: Get embeddings for a list of texts

**Endpoint**: `http://localhost:8000/embed`

**Request**:
```json
{
  "texts": [
    "₹420 spent on Food at Zomato on 2025-12-29",
    "₹1,200 spent on Transport via Uber on 2025-12-28",
    "₹2,100 spent on Entertainment at Netflix on 2025-12-26"
  ]
}
```

**Response**:
```json
{
  "embeddings": [
    [0.123, 0.456, 0.789, ..., 0.234],  // 384-dim vector for fact 1
    [0.234, 0.567, 0.890, ..., 0.345],  // 384-dim vector for fact 2
    [0.345, 0.678, 0.901, ..., 0.456]   // 384-dim vector for fact 3
  ]
}
```

**Details**:
- Input texts: Any strings (facts, questions, etc.)
- Output dimensions: 384
- Model: all-MiniLM-L6-v2 (Sentence Transformers)
- Speed: 100-200ms for 10 texts
- Format: NumPy arrays converted to JSON lists

---

## Offline Job

### buildKnowledgebase.js

**Purpose**: Pre-compute embeddings for all user expenses (offline)

**Location**: `/server/jobs/buildKnowledgebase.js`

**Usage**:
```bash
cd server
node jobs/buildKnowledgebase.js
```

**Process**:
1. Fetch all expenses from MongoDB
2. For each user:
   - Build textual facts from expenses
   - Send facts to ML service for embeddings
   - Save facts + embeddings to disk
3. Output logs for monitoring

**Output Structure**:
```
server/knowledgebase/
├── {userId1}/
│   ├── facts.json        # ["₹420 spent on Food...", ...]
│   └── embeddings.json   # [[...], [...], ...]
├── {userId2}/
│   ├── facts.json
│   └── embeddings.json
└── ...
```

**Log Output**:
```
🚀 Starting buildKnowledgebase job...
👥 Found 5 users with expenses
🔄 Building knowledge base for user 507f1f77bcf86cd799439011...
📊 Found 47 expenses
📝 Built 47 facts
🔗 Sending facts to ML service for embeddings...
✅ Knowledge base saved for user 507f1f77bcf86cd799439011
...
✅ buildKnowledgebase job completed!
```

**Error Handling**:
- If ML service unreachable: logs error, skips user, continues
- If expense fetch fails: logs error, skips user, continues
- Idempotent: Safe to run multiple times

**Scheduling** (Recommended):
```bash
# Add to crontab for periodic rebuilds
0 */6 * * * cd /path/to/server && node jobs/buildKnowledgebase.js >> logs/kb-build.log 2>&1
```

---

## Data Models

### Expense (from MongoDB)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: Number,
  currency: "INR" | "USD" | ...,
  description: String,
  category: String,           // e.g., "Food", "Transport"
  subcategory: String,        // Optional
  paymentMethod: "cash" | "card" | "upi" | "bank" | "other",
  merchant: String,           // e.g., "Zomato", "Uber"
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Fact (Text Representation)

```
₹{amount} spent on {category} at {merchant} on {date}
```

**Examples**:
- `₹420 spent on Food at Zomato on 2025-12-29`
- `₹1,200 spent on Transport via Uber on 2025-12-28`
- `₹50 spent on Shopping on Amazon on 2025-12-27`

### Embedding (Vector)

```javascript
[
  0.123, 0.456, 0.789, ..., 0.234  // 384 dimensions
]
```

**Properties**:
- Dimension: 384 (all-MiniLM-L6-v2)
- Type: Float32
- Range: [-1, 1] (approximately)
- Semantic similarity: Measured by L2 distance

### AI Verdict Response

```javascript
{
  verdict: String,          // Markdown formatted insights
  factsUsed: String[],      // Top-5 facts
  question: String          // Original question
}
```

---

## Error Codes

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| 400 | Question is required | Empty/missing question | Provide non-empty question |
| 401 | Unauthorized | Invalid/missing auth token | Login and get valid JWT |
| 404 | No knowledge base found | User has no KB built | Run `buildKnowledgebase.js` |
| 500 | Failed to generate verdict | ML/LLM error | Check service logs |

---

## Rate Limiting

**Current**: None (can add later if needed)

**Recommended** (if adding):
```
- 10 requests per minute per user
- 1000 requests per hour per server
```

---

## Security

### Authentication
- Endpoint protected by `authMiddleware`
- Requires valid JWT in `Authorization` header

### Authorization
- Users can only query their own knowledge base
- No cross-user data exposure

### Data Privacy
- User expenses never logged
- Only sent to Google API
- Facts stored locally on server

### API Key Management
- `GOOGLE_API_KEY` in `.env`
- Never exposed in responses
- Rotatable without code changes

---

## Performance Metrics

| Operation | Time | Notes |
|-----------|------|-------|
| Embed 1 text | 50-100ms | Via ML service |
| Embed 100 texts | 100-200ms | Batch processing |
| FAISS search (5 facts) | 1-5ms | L2 distance |
| Gemini API call | 5-15 sec | Includes wait time |
| **Total verdict request** | 6-20 sec | Network + LLM dominant |

---

## Integration Examples

### React Component

```typescript
const handleAnalyze = async () => {
  const response = await fetch('/api/ai/verdict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      question: "Why am I overspending this month?"
    })
  });
  
  const { verdict, factsUsed } = await response.json();
  console.log(verdict);
};
```

### Node.js Backend

```javascript
const axios = require('axios');

async function getAIVerdict(userId, question, token) {
  const response = await axios.post(
    'http://localhost:5000/api/ai/verdict',
    { question },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
}
```

### Python Backend

```python
import requests

def get_ai_verdict(question: str, token: str) -> dict:
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.post(
        'http://localhost:5000/api/ai/verdict',
        json={'question': question},
        headers=headers
    )
    
    return response.json()
```

---

## Changelog

### v1.0 (Current)
- ✅ Single question per request
- ✅ Top-5 facts retrieval
- ✅ Gemini 1.5 Flash LLM
- ✅ Per-user knowledge base
- ✅ Offline batch processing

### v1.1 (Planned)
- [ ] Follow-up questions in same session
- [ ] Custom fact count (k-parameter)
- [ ] Model selection (Gemini, Claude, etc.)

### v2.0 (Future)
- [ ] Real vector database (Pinecone)
- [ ] Real-time indexing
- [ ] Multi-language support
- [ ] Fine-tuned models

---

**Last Updated**: December 31, 2025
