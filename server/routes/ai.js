const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { generateVerdict } = require("../services/llmService");
const { buildForUser } = require("../jobs/buildKnowledgebase");
const authMiddleware = require("../middleware/auth");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:7860";
const KNOWLEDGE_BASE_DIR = path.join(__dirname, "../knowledgebase");

/**
 * Load user's knowledge base from disk
 */
function loadUserKnowledgeBase(userId) {
  const userDir = path.join(KNOWLEDGE_BASE_DIR, userId.toString());

  if (!fs.existsSync(userDir)) {
    return null;
  }

  try {
    const factsFile = path.join(userDir, "facts.json");
    const embeddingsFile = path.join(userDir, "embeddings.json");

    const facts = JSON.parse(fs.readFileSync(factsFile, "utf8"));
    const embeddings = JSON.parse(fs.readFileSync(embeddingsFile, "utf8"));

    return { facts, embeddings };
  } catch (err) {
    console.error(`Error loading knowledge base for user ${userId}:`, err);
    return null;
  }
}

/**
 * Check ML service health before making requests
 */
async function checkMLServiceHealth() {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (err) {
    console.error("ML service health check failed:", err.message);
    return false;
  }
}

/**
 * Get embedding for a query from ML service
 */
async function getQueryEmbedding(question) {
  try {
    // Check if ML service is running
    const isHealthy = await checkMLServiceHealth();
    if (!isHealthy) {
      throw new Error("ML service is not responding. Please try again later.");
    }

    const response = await axios.post(`${ML_SERVICE_URL}/embed`, {
      texts: [question],
    }, {
      timeout: 10000, // 10 second timeout
      headers: { "Content-Type": "application/json" },
    });

    // Validate response structure
    if (!response.data || !response.data.embeddings || !Array.isArray(response.data.embeddings)) {
      throw new Error("Invalid embedding response format from ML service");
    }

    if (response.data.embeddings.length === 0) {
      throw new Error("Empty embeddings returned from ML service");
    }

    return response.data.embeddings[0];
  } catch (err) {
    console.error("Error getting query embedding:", err.message);
    throw new Error(`Failed to embed question: ${err.message}`);
  }
}

/**
 * Simple L2 distance similarity search
 * Returns top-k indices
 */
function similaritySearch(queryEmbedding, embeddings, k = 5) {
  // Validate inputs
  if (!queryEmbedding || !Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new Error("Invalid query embedding");
  }

  if (!embeddings || !Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error("No embeddings available for similarity search");
  }

  const distances = embeddings.map((emb, idx) => {
    // Validate each embedding
    if (!Array.isArray(emb) || emb.length === 0) {
      throw new Error(`Invalid embedding at index ${idx}`);
    }

    // L2 distance
    const dist = Math.sqrt(
      emb.reduce((sum, val, i) => sum + Math.pow(val - (queryEmbedding[i] || 0), 2), 0)
    );
    return { index: idx, distance: dist };
  });

  // Sort by distance (ascending) and return top-k
  return distances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, Math.min(k, distances.length))
    .map((d) => d.index);
}

/**
 * POST /api/ai/build
 * Trigger knowledge base building for current user
 * This indexes all their expenses into embeddings
 */
router.post("/build", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔨 Building knowledge base for user ${userId}...`);

    // Run the build job asynchronously
    buildForUser(userId)
      .then(() => {
        console.log(`✅ Knowledge base built for user ${userId}`);
      })
      .catch((err) => {
        console.error(`❌ Error building KB for user ${userId}:`, err);
      });

    // Return immediately with 202 Accepted (processing)
    res.status(202).json({
      message: "Knowledge base build in progress",
      userId,
    });
  } catch (err) {
    console.error("Error initiating knowledge base build:", err);
    res.status(500).json({ message: "Failed to initiate knowledge base build" });
  }
});

/**
 * POST /api/ai/verdict
 * Input: { question: "Why am I overspending this month?" }
 * Output: { verdict: "...", factsUsed: [...] }
 */
router.post("/verdict", authMiddleware, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: "Question is required" });
    }

    const userId = req.user.id;
    console.log(`🤖 Processing AI verdict for user ${userId}: "${question}"`);

    // Step 1: Load user's knowledge base
    let kb = loadUserKnowledgeBase(userId);
    
    if (!kb) {
      console.log(`📦 Knowledge base not found for user ${userId}. Building...`);
      
      // Build knowledge base synchronously if not found
      try {
        await buildForUser(userId);
        kb = loadUserKnowledgeBase(userId);
        
        if (!kb) {
          return res.status(404).json({
            message:
              "No expenses found to analyze. Please add expenses first.",
          });
        }
        
        console.log(`✅ Knowledge base built successfully for user ${userId}`);
      } catch (err) {
        console.error(`❌ Failed to build knowledge base for user ${userId}:`, err.message);
        return res.status(503).json({
          message: "Failed to build knowledge base. Please try again.",
          error: err.message
        });
      }
    }

    // Step 2: Embed the question
    let queryEmbedding;
    try {
      queryEmbedding = await getQueryEmbedding(question);
      console.log(`✅ Embedded question successfully`);
    } catch (err) {
      console.error("Error embedding question:", err.message);
      return res.status(503).json({ 
        message: "ML service unavailable. Please try again.",
        error: err.message 
      });
    }

    // Step 3: FAISS similarity search
    const topIndices = similaritySearch(queryEmbedding, kb.embeddings, 5);
    const retrievedFacts = topIndices.map((idx) => kb.facts[idx]);
    console.log(`📊 Retrieved ${retrievedFacts.length} relevant facts`);

    // Step 4: Generate verdict using LLM
    let verdict;
    try {
      verdict = await generateVerdict(question, retrievedFacts);
      console.log(`✅ Generated verdict successfully`);
    } catch (err) {
      console.error("Error generating verdict:", err.message);
      return res.status(503).json({ 
        message: "Gemini API unavailable. Please check your API key.",
        error: err.message 
      });
    }

    res.json({
      verdict,
      factsUsed: retrievedFacts,
      question,
    });
  } catch (err) {
    console.error("Error in AI verdict:", err);
    res.status(500).json({ 
      message: "Failed to generate verdict",
      error: err.message 
    });
  }
});

module.exports = router;
