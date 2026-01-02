// HuggingFace Configuration
const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";
const ENABLE_GEMINI = process.env.ENABLE_GEMINI === "true";

// Gemini (optional, for backwards compatibility)
let genAI = null;
if (ENABLE_GEMINI) {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.warn('⚠️ Gemini not available:', err.message);
  }
}

// Validate on startup
if (!HF_API_KEY) {
  console.error('⚠️ WARNING: HF_API_KEY not set. AI verdict will use local analysis fallback.');
  console.error('   Get token from: https://huggingface.co/settings/tokens');
} else {
  console.log(`✅ HuggingFace API configured with model: ${HF_MODEL}`);
}

/**
 * LLM Service
 * Primary: HuggingFace Mistral API
 * Fallback: Local heuristic analysis
 */

const PROMPT_TEMPLATE = `You are a personal finance AI assistant.

User question:
{{user_question}}

Relevant spending facts:
{{retrieved_facts}}

Please provide:
1. Clear analysis of the situation
2. Key reason(s) or patterns
3. 2-3 actionable suggestions

Be concise and specific with numbers from the facts provided.`;

/**
 * Call HuggingFace Inference API with Mistral
 */
async function callHuggingFaceAPI(prompt) {
  if (!HF_API_KEY) {
    throw new Error('HF_API_KEY not configured');
  }

  console.log(`🔄 Calling HuggingFace API with model: ${HF_MODEL}...`);

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.4,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HF API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  // HF returns array of objects with generated_text
  if (!Array.isArray(data) || !data[0]?.generated_text) {
    throw new Error('Invalid HF response format');
  }

  const text = data[0].generated_text.trim();
  console.log(`✅ HuggingFace API response received (${text.length} chars)`);
  return text;
}

/**
 * Call Gemini API (optional fallback)
 */
async function callGeminiAPI(prompt) {
  if (!ENABLE_GEMINI || !genAI) {
    throw new Error('Gemini not enabled');
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

  for (const modelName of modelsToTry) {
    try {
      console.log(`🔄 Trying Gemini model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`✅ Gemini API response received from ${modelName}`);
      return text;
    } catch (err) {
      console.warn(`⚠️ Model ${modelName} failed:`, err.message);
    }
  }

  throw new Error('All Gemini models failed');
}

/**
 * Generate financial verdict using LLM
 * @param {string} userQuestion - User's question
 * @param {string[]} retrievedFacts - Top-k facts from FAISS search
 * @returns {Promise<string>} - LLM response
 */
async function generateVerdict(userQuestion, retrievedFacts) {
  try {
    const prompt = PROMPT_TEMPLATE.replace(
      "{{user_question}}",
      userQuestion
    ).replace(
      "{{retrieved_facts}}",
      retrievedFacts.length > 0 
        ? retrievedFacts.map(f => `- ${f}`).join("\n")
        : "No spending data available"
    );

    // Try HuggingFace first
    try {
      return await callHuggingFaceAPI(prompt);
    } catch (hfErr) {
      console.warn(`❌ HuggingFace failed:`, hfErr.message);

      // Try Gemini if enabled
      if (ENABLE_GEMINI) {
        try {
          return await callGeminiAPI(prompt);
        } catch (geminiErr) {
          console.warn(`❌ Gemini also failed:`, geminiErr.message);
        }
      }

      // Fall through to local analysis
      throw hfErr;
    }
  } catch (err) {
    console.error('❌ Error in LLM service:', {
      message: err.message,
      hfConfigured: !!HF_API_KEY,
      geminiEnabled: ENABLE_GEMINI,
    });
    
    // Don't throw - use local analysis as fallback
    console.log('💾 Falling back to local heuristic analysis...');
    return generateLocalAnalysis(userQuestion, retrievedFacts);
  }
}

/**
 * Generate local analysis using heuristics
 * Fallback when all APIs fail
 */
function generateLocalAnalysis(userQuestion, retrievedFacts) {
  console.log('📊 Generating local analysis from facts...');
  
  if (retrievedFacts.length === 0) {
    return `I don't have enough spending data to analyze yet. Start adding expenses to get personalized insights!`;
  }

  const factCount = retrievedFacts.length;
  
  // Extract amounts from facts
  const totalAmount = retrievedFacts
    .map((fact) => {
      let match = fact.match(/₹([\d,]+)/);
      if (!match) match = fact.match(/INR([\d,]+)/);
      return match ? parseInt(match[1].replace(/,/g, "")) : 0;
    })
    .reduce((a, b) => a + b, 0);

  const avgAmount = factCount > 0 ? Math.round(totalAmount / factCount) : 0;

  // Extract categories
  const categories = {};
  retrievedFacts.forEach((fact) => {
    const match = fact.match(/spent on (\w+)/i);
    if (match) {
      categories[match[1]] = (categories[match[1]] || 0) + 1;
    }
  });

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

  return `Based on your spending data from ${factCount} transactions:

📊 Key Metrics:
- Total spent: ₹${totalAmount.toLocaleString("en-IN")}
- Average transaction: ₹${avgAmount.toLocaleString("en-IN")}
- Top category: ${topCategory ? topCategory[0] : "Miscellaneous"} (${topCategory ? topCategory[1] : 0} transactions)

💡 Quick Insights:
1. You're tracking ${factCount} expense(s) - keep building this habit
2. Your spending patterns show focus on ${topCategory ? topCategory[0].toLowerCase() : "various categories"}
3. Monitor your trends regularly to identify optimization opportunities

📌 Note: These are basic calculations from your expense data. For deeper AI-powered analysis, ensure HuggingFace API is configured.`;
}

module.exports = {
  generateVerdict,
};
