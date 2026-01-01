const axios = require("axios");
const crypto = require("crypto");

const NLP_SERVICE_URL =
  process.env.NLP_SERVICE_URL || "http://localhost:8000";

/**
 * LRU Cache for expense classifications
 * Typical expenses like "Starbucks", "Uber", "Whole Foods" are repeated often
 * This cache provides massive speedup (300-500x) for duplicate descriptions
 */
class ClassificationCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  getCacheKey(text) {
    // Create hash of the description for consistent cache keys
    // Normalize text: trim and lowercase for fuzzy matching
    const normalized = text.trim().toLowerCase();
    return crypto.createHash("md5").update(normalized).digest("hex");
  }

  get(text) {
    const key = this.getCacheKey(text);
    if (this.cache.has(key)) {
      // Move to end (LRU)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(text, value) {
    const key = this.getCacheKey(text);
    
    // Remove if exists (to update position)
    this.cache.delete(key);
    
    // Add new entry
    this.cache.set(key, value);
    
    // Evict oldest if over capacity
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const cache = new ClassificationCache(1000);

async function classifyExpense(text) {
  try {
    // Step 1: Check cache first (huge speedup for repeated expenses)
    const cachedResult = cache.get(text);
    if (cachedResult) {
      console.log(`✅ Cache hit for classification: "${text.substring(0, 30)}..."`);
      return cachedResult;
    }

    // Step 2: Make API request to ML service
    const res = await axios.post(
      `${NLP_SERVICE_URL}/classify`,
      { text },
      {
        timeout: 8000, // 8 second timeout
        headers: { "Content-Type": "application/json" },
      }
    );

    // Step 3: Validate response
    if (!res.data || typeof res.data.category !== "string") {
      console.warn(`Invalid classification response for: "${text}"`);
      return null;
    }

    const result = res.data; // { category, confidence }

    // Step 4: Store in cache for future use
    cache.set(text, result);
    console.log(
      `📝 Classified: "${text.substring(0, 30)}..." → ${result.category} (${(
        result.confidence * 100
      ).toFixed(1)}%)`
    );

    return result;
  } catch (err) {
    console.error(
      `NLP Service Error for "${text.substring(0, 30)}...":`,
      err.message
    );
    // Return null on error - expense will be unclassified but won't crash
    return null;
  }
}

module.exports = { classifyExpense, cache };
