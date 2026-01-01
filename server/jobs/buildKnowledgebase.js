const Expense = require("../Models/Expense");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Offline job to:
 * 1. Fetch all user expenses
 * 2. Build textual facts
 * 3. Send to ML service for embeddings
 * 4. Store in FAISS vector store (per user)
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const KNOWLEDGE_BASE_DIR = path.join(__dirname, "../knowledgebase");

// Ensure knowledge base directory exists
if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
  fs.mkdirSync(KNOWLEDGE_BASE_DIR, { recursive: true });
}

/**
 * Format expense into a textual fact
 * Examples:
 * "₹420 spent on Food at Zomato on 2025-12-29"
 * "₹1,200 spent on Transport via Uber this month"
 */
function buildFact(expense) {
  const amount = expense.amount.toLocaleString("en-IN");
  const currency = expense.currency || "₹";
  const category = expense.category || "Uncategorized";
  const merchant = expense.merchant || expense.description;
  const dateStr = new Date(expense.date).toISOString().split("T")[0];

  return `${currency}${amount} spent on ${category} at ${merchant} on ${dateStr}`;
}

/**
 * Fetch all expenses for a user
 */
async function fetchUserExpenses(userId) {
  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    return expenses;
  } catch (err) {
    console.error(`Error fetching expenses for user ${userId}:`, err);
    return [];
  }
}

/**
 * Get embeddings from ML service
 */
async function getEmbeddings(facts) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/embed`, {
      texts: facts,
    });
    return response.data.embeddings;
  } catch (err) {
    console.error("Error getting embeddings from ML service:", err.message);
    throw err;
  }
}

/**
 * Save FAISS index and facts to disk (per user)
 */
function saveKnowledgeBase(userId, facts, embeddings) {
  const userDir = path.join(KNOWLEDGE_BASE_DIR, userId.toString());
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  // Save facts as JSON
  const factsFile = path.join(userDir, "facts.json");
  fs.writeFileSync(factsFile, JSON.stringify(facts, null, 2));

  // Save embeddings as JSON
  const embeddingsFile = path.join(userDir, "embeddings.json");
  fs.writeFileSync(embeddingsFile, JSON.stringify(embeddings, null, 2));

  console.log(`✅ Knowledge base saved for user ${userId}`);
}

/**
 * Build knowledge base for a single user
 */
async function buildForUser(userId) {
  console.log(`\n🔄 Building knowledge base for user ${userId}...`);

  try {
    // Step 1: Fetch expenses
    const expenses = await fetchUserExpenses(userId);
    if (expenses.length === 0) {
      console.log(`⚠️  No expenses found for user ${userId}`);
      return;
    }

    console.log(`📊 Found ${expenses.length} expenses`);

    // Step 2: Build facts
    const facts = expenses.map(buildFact);
    console.log(`📝 Built ${facts.length} facts`);

    // Step 3: Get embeddings
    console.log("🔗 Sending facts to ML service for embeddings...");
    const embeddings = await getEmbeddings(facts);

    // Step 4: Save to disk
    saveKnowledgeBase(userId, facts, embeddings);
  } catch (err) {
    console.error(`❌ Error building knowledge base for user ${userId}:`, err.message);
  }
}

/**
 * Main job: Build knowledge base for all users
 */
async function buildAllKnowledgeBases() {
  console.log("\n🚀 Starting buildKnowledgebase job...");

  try {
    // Connect to MongoDB with timeout settings
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/vittmoney";
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected");

    // Fetch unique user IDs
    const uniqueUsers = await Expense.distinct("userId");
    console.log(`👥 Found ${uniqueUsers.length} users with expenses`);

    // Build for each user
    for (const userId of uniqueUsers) {
      await buildForUser(userId);
    }

    console.log("\n✅ buildKnowledgebase job completed!");
    
    // Close MongoDB connection
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Fatal error in buildKnowledgebase:", err.message);
    process.exit(1);
  }
}

// If run directly (not imported)
if (require.main === module) {
  buildAllKnowledgeBases().then(() => {
    process.exit(0);
  });
}

module.exports = { buildAllKnowledgeBases, buildForUser };
