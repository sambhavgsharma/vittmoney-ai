/**
 * Currency conversion rates (relative to INR)
 * These are approximate rates and should be updated periodically
 * For production, consider using a live currency API
 */
const EXCHANGE_RATES = {
  INR: 1,
  USD: 0.012, // 1 INR = ~0.012 USD
  EUR: 0.011, // 1 INR = ~0.011 EUR
  GBP: 0.0095, // 1 INR = ~0.0095 GBP
  JPY: 1.8, // 1 INR = ~1.8 JPY
};

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

/**
 * Convert amount from INR to target currency
 * @param {number} amountInINR - Amount in INR
 * @param {string} targetCurrency - Target currency code (INR, USD, EUR, GBP, JPY)
 * @returns {number} - Converted amount
 */
function convertCurrency(amountInINR, targetCurrency = 'INR') {
  if (!amountInINR || !EXCHANGE_RATES[targetCurrency]) {
    return amountInINR;
  }
  return Math.round(amountInINR * EXCHANGE_RATES[targetCurrency] * 100) / 100;
}

/**
 * Format amount with currency symbol and proper decimal places
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted amount (e.g., "₹1,000.00")
 */
function formatCurrency(amount, currency = 'INR') {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  
  // Determine decimal places based on currency
  const decimalPlaces = currency === 'JPY' ? 0 : 2;
  
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })}`;
}

/**
 * Convert and format in one step
 * @param {number} amountInINR - Amount in INR
 * @param {string} targetCurrency - Target currency code
 * @returns {string} - Formatted converted amount
 */
function convertAndFormat(amountInINR, targetCurrency = 'INR') {
  const converted = convertCurrency(amountInINR, targetCurrency);
  return formatCurrency(converted, targetCurrency);
}

module.exports = {
  convertCurrency,
  formatCurrency,
  convertAndFormat,
  EXCHANGE_RATES,
  CURRENCY_SYMBOLS,
};
