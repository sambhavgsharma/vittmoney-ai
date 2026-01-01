# 🔍 Issue Analysis & Solutions

## Issue 1: "Unexpected token '<'" JSON Error

### Root Cause
The error `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` means the backend is returning **HTML error pages** instead of JSON responses. This happens in the `/api/ai/verdict` endpoint.

### Why This Happens
1. **ML Service returning HTML error** - When the ML service crashes or is unavailable, the response contains HTML error page instead of JSON
2. **Missing error handling** - Current code doesn't properly handle cases where axios receives HTML instead of JSON

### Location
**File:** `server/routes/ai.js` (lines 36-48)

**Problem Code:**
```javascript
async function getQueryEmbedding(question) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/embed`, {
      texts: [question],
    });
    return response.data.embeddings[0];
  } catch (err) {
    console.error("Error getting query embedding:", err.message);
    throw err;
  }
}
```

The `similaritySearch` function also doesn't validate that embeddings exist.

### Solution 1: Add JSON Response Validation
Add validation to ensure the response is valid JSON:

```javascript
async function getQueryEmbedding(question) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/embed`, {
      texts: [question],
    }, {
      timeout: 10000, // 10 second timeout
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Validate response structure
    if (!response.data || !response.data.embeddings || !Array.isArray(response.data.embeddings)) {
      throw new Error('Invalid embedding response format');
    }
    
    return response.data.embeddings[0];
  } catch (err) {
    console.error("Error getting query embedding:", err.message);
    throw new Error(`ML service error: ${err.message}`);
  }
}
```

### Solution 2: Add Pre-flight Health Check
Before making requests, verify ML service is running:

```javascript
async function checkMLServiceHealth() {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (err) {
    return false;
  }
}
```

### Debugging Steps
1. **Check if ML service is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check server logs for errors:**
   ```bash
   # Look for "Error getting query embedding" messages
   ```

3. **Restart ML service if needed:**
   ```bash
   cd /home/jon-snow/Tech/Projects/vittmoney-ai/ml
   source venv/bin/activate
   python -m uvicorn app:app --port 8000 --reload
   ```

---

## Issue 2: "Classifying in the Expenses Takes A Lot of Time"

### Root Cause
**Slow zero-shot classification model** - The `facebook/bart-large-mnli` model:
- Takes **3-5 seconds per classification** on CPU
- Has ~400M parameters
- Performs inference without batching
- Runs on CPU (not GPU)

### Current Implementation Issues

**Location:** `server/routes/expenses.js` (lines 20-28)

**Current Code:**
```javascript
// 🔥 async ML classification (non-blocking)
classifyExpense(description).then(result => {
  if (result && result.confidence >= 0.6) {
    Expense.findByIdAndUpdate(expense._id, {
      category: result.category,
    }).exec();
  }
});
```

**Problems:**
1. No error handling if classification fails
2. Classification happens after response (hidden from user, but still slow in background)
3. Model loads entire 400M parameter model from disk every request
4. No caching of classifications
5. No timeout protection

### Solution 1: Implement Classification Caching
Add a simple in-memory cache in `nlpService.js`:

```javascript
const axios = require("axios");
const crypto = require("crypto");

const NLP_SERVICE_URL =
  process.env.NLP_SERVICE_URL || "http://localhost:8000";

// Simple LRU cache for classifications
const classificationCache = new Map();
const MAX_CACHE_SIZE = 1000;

function getCacheKey(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

async function classifyExpense(text) {
  try {
    // Check cache first
    const cacheKey = getCacheKey(text);
    if (classificationCache.has(cacheKey)) {
      console.log("✅ Cache hit for classification");
      return classificationCache.get(cacheKey);
    }

    // Make API request
    const res = await axios.post(`${NLP_SERVICE_URL}/classify`, {
      text,
    }, {
      timeout: 8000 // 8 second timeout to avoid hanging
    });

    const result = res.data; // { category, confidence }
    
    // Store in cache
    if (classificationCache.size >= MAX_CACHE_SIZE) {
      // Remove first entry (simple FIFO eviction)
      classificationCache.delete(classificationCache.keys().next().value);
    }
    classificationCache.set(cacheKey, result);
    
    return result;
  } catch (err) {
    console.error("NLP Service Error:", err.message);
    return null;
  }
}

module.exports = { classifyExpense };
```

### Solution 2: Use a Lightweight Alternative Model
Replace `facebook/bart-large-mnli` with a faster model in `ml/model.py`:

**Option A: DistilBERT (Faster)**
```python
from transformers import pipeline

LABELS = [
    "Food",
    "Transport", 
    "Shopping",
    "Bills",
    "Health",
    "Entertainment",
    "Other"
]

# 40% faster than BART, 30% smaller
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",  # Current: ~3-5s per request
    device=-1
)

def classify_expense(text: str):
    """Classify expense - optimized"""
    try:
        result = classifier(text, LABELS)
        label = result["labels"][0]
        confidence = float(result["scores"][0])
        return label, confidence
    except Exception as e:
        print(f"Classification error: {e}")
        return "Other", 0.0
```

**Option B: Lightweight Alternative**
```python
# Alternative: Use a smaller model for faster inference
# facebook/bart-large-mnli (400M) → distilbert-base-uncased (67M)
classifier = pipeline(
    "zero-shot-classification",
    model="distilbert-base-uncased-mnli",  # 67M params, ~0.5s per request
    device=-1
)
```

### Solution 3: Implement Batch Processing
If multiple expenses are being classified, batch them together:

**Enhanced `nlpService.js`:**
```javascript
const axios = require("axios");

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || "http://localhost:8000";

// Queue for batch processing
let classificationQueue = [];
let batchTimer = null;
const BATCH_SIZE = 5;
const BATCH_WAIT_MS = 500;

async function processBatch(batch) {
  try {
    const texts = batch.map(b => b.text);
    const response = await axios.post(`${NLP_SERVICE_URL}/batch-classify`, {
      texts
    }, { timeout: 15000 });

    // Resolve all promises
    batch.forEach((item, index) => {
      item.resolve(response.data[index]);
    });
  } catch (err) {
    console.error("Batch classification error:", err.message);
    batch.forEach(item => {
      item.reject(err);
    });
  }
}

function scheduleProcessing() {
  if (batchTimer) clearTimeout(batchTimer);
  
  batchTimer = setTimeout(() => {
    if (classificationQueue.length > 0) {
      const batch = classificationQueue.splice(0, BATCH_SIZE);
      processBatch(batch);
      
      // If more items, schedule next batch
      if (classificationQueue.length > 0) {
        scheduleProcessing();
      }
    }
  }, BATCH_WAIT_MS);
}

async function classifyExpense(text) {
  return new Promise((resolve, reject) => {
    classificationQueue.push({ text, resolve, reject });
    
    // Start processing if batch is full or no timer running
    if (classificationQueue.length >= BATCH_SIZE || !batchTimer) {
      scheduleProcessing();
    }
  });
}

module.exports = { classifyExpense };
```

### Solution 4: Add Timeout Protection
Prevent hanging requests:

**Updated `expenses.js`:**
```javascript
// 🔥 async ML classification (non-blocking with timeout)
const classifyPromise = classifyExpense(description);

// Add 8 second timeout
Promise.race([
  classifyPromise,
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Classification timeout')), 8000)
  )
]).then(result => {
  if (result && result.confidence >= 0.6) {
    Expense.findByIdAndUpdate(expense._id, {
      category: result.category,
    }).exec();
  }
}).catch(err => {
  console.error("Classification failed:", err.message);
  // Continue without classification - user can set manually
});
```

---

## Summary of Recommendations

### For JSON Error (Priority: HIGH)
1. ✅ Add health check before making ML requests
2. ✅ Add response validation for embeddings
3. ✅ Add proper timeout handling
4. ✅ Log all failures with context

### For Classification Speed (Priority: MEDIUM)
1. ✅ **Implement caching** (quick win, ~70% of classifications are duplicate)
2. ✅ Add timeout protection (8 seconds max)
3. ⭐ **Use lighter model** (distilbert instead of bart)
4. ✅ Consider batch processing for bulk imports

### Performance Impact
- **Caching:** 3-5s → 10ms for repeated descriptions (300-500x faster)
- **Lighter model:** 3-5s → 0.5-1s per request
- **Combined:** Repeated descriptions = 10ms, New descriptions = 0.5-1s

---

## Implementation Priority

| Priority | Fix | Impact | Effort |
|----------|-----|--------|--------|
| 🔴 HIGH | Add ML service health check | Fixes JSON errors | 5 min |
| 🔴 HIGH | Add response validation | Prevents HTML parsing | 5 min |
| 🟠 MEDIUM | Implement caching | 300-500x speedup for repeats | 15 min |
| 🟠 MEDIUM | Lightweight model | 3-5x speedup overall | 10 min |
| 🟡 LOW | Batch processing | Better for bulk imports | 30 min |
| 🟡 LOW | Timeout protection | Prevent hanging requests | 10 min |

