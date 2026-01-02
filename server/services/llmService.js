const { GoogleGenerativeAI } = require("@google/generative-ai");

// Validate Gemini API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error('⚠️  WARNING: GEMINI_API_KEY not set. AI verdict will not work.');
  console.error('   Please set GEMINI_API_KEY environment variable in your deployment platform.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * LLM Service
 * Wraps Google Gemini API
 * Easy to swap models later
 */

const PROMPT_TEMPLATE = `You are a financial assistant.

Facts about the user's spending:
{{retrieved_facts}}

Question:
{{user_question}}

Rules:
- Use only the facts above
- Be specific with numbers
- Give at most 3 actionable suggestions
- Do not speculate beyond data`;

/**
 * Generate financial verdict using LLM
 * @param {string} userQuestion - User's question
 * @param {string[]} retrievedFacts - Top-k facts from FAISS search
 * @returns {Promise<string>} - LLM response
 */
async function generateVerdict(userQuestion, retrievedFacts) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured. Please set it in your environment variables.');
    }

    // Construct prompt
    const prompt = PROMPT_TEMPLATE.replace(
      "{{retrieved_facts}}",
      retrievedFacts.join("\n")
    ).replace("{{user_question}}", userQuestion);

    // Try models in order of preference
    const modelsToTry = [
      "gemini-2.0-flash",      // Newest model (if available)
      "gemini-1.5-pro",        // More capable
      "gemini-1.5-flash",      // Fast and cost-effective
      "gemini-pro",            // Fallback
    ];

    let lastError = null;
    for (const modelName of modelsToTry) {
      try {
        console.log(`🔄 Calling Gemini API with model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log(`✅ Gemini API response received from ${modelName}`);
        return text;
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ Model ${modelName} failed:`, err.message);
        // Continue to next model
      }
    }

    // If all models failed, throw the last error
    throw lastError || new Error('All Gemini models failed');
  } catch (err) {
    console.error('❌ Error in LLM service:', {
      message: err.message,
      code: err.code,
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
    
    // Return a helpful error message
    const errorMessage = !process.env.GEMINI_API_KEY 
      ? 'AI insights are temporarily unavailable. Please ensure GEMINI_API_KEY is properly configured in your environment variables.'
      : err.message.includes('404')
        ? 'Model not found. Your API key may not have access to Gemini models. Please ensure your API key is valid and has the required permissions.'
        : `AI insights are temporarily unavailable (${err.message}). Please check your Gemini API quota or try again later.`;
    
    throw new Error(errorMessage);
  }
}

/**
 * Generate local analysis without API call
 * Useful when API quota is exceeded
 */
function generateLocalAnalysis(userQuestion, retrievedFacts) {
  const factCount = retrievedFacts.length;
  const totalAmount = retrievedFacts
    .map((fact) => {
      // Match both ₹ and INR currency markers
      let match = fact.match(/₹([\d,]+)/);
      if (!match) {
        match = fact.match(/INR([\d,]+)/);
      }
      return match ? parseInt(match[1].replace(/,/g, "")) : 0;
    })
    .reduce((a, b) => a + b, 0);

  const avgAmount = factCount > 0 ? Math.round(totalAmount / factCount) : 0;

  const categories = {};
  retrievedFacts.forEach((fact) => {
    const match = fact.match(/spent on (\w+)/);
    if (match) {
      categories[match[1]] = (categories[match[1]] || 0) + 1;
    }
  });

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

  return `Based on your spending data from ${factCount} transactions (₹${totalAmount.toLocaleString("en-IN")} total):

📊 Analysis:
- Average transaction: ₹${avgAmount.toLocaleString("en-IN")}
- Total spent: ₹${totalAmount.toLocaleString("en-IN")}
- Most frequent category: ${topCategory ? topCategory[0] : "Food"} (${topCategory ? topCategory[1] : 0} transactions)

💡 Suggestions:
1. Review your ${topCategory ? topCategory[0] : "Food"} spending as it's your highest category
2. Set spending limits for recurring expenses
3. Track daily expenses to identify patterns

Note: This is a local analysis. For AI-powered insights, please check your API quota.`;
}


module.exports = {
  generateVerdict,
};
