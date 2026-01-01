const { GoogleGenerativeAI } = require("@google/generative-ai");

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
    // Construct prompt
    const prompt = PROMPT_TEMPLATE.replace(
      "{{retrieved_facts}}",
      retrievedFacts.join("\n")
    ).replace("{{user_question}}", userQuestion);

    // Try Gemini 1.5 Pro as it's more stable
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (err) {
      // Fallback if 1.5-pro fails
      if (err.message && err.message.includes("429")) {
        // Rate limited - use local analysis
        console.warn("⚠️ Gemini API rate limited, using local analysis");
        return generateLocalAnalysis(userQuestion, retrievedFacts);
      }
      throw err;
    }
  } catch (err) {
    console.error("Error in LLM service:", err.message);
    // Fallback to local analysis if API fails
    return generateLocalAnalysis(userQuestion, retrievedFacts);
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
