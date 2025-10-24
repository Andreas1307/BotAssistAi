// --- Ensure NODE_ENV/ENV set:
// HOST = "https://api.botassistai.com"
// SHOPIFY_API_KEY, SHOPIFY_API_SECRET set

const API_HOST = 'https://api.botassistai.com';      // full URL
const API_HOSTNAME = 'api.botassistai.com';         // hostname used by SDK

// shopify config: make sure hostName matches your API host (no protocol)
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');
const { storeCallback, loadCallback, deleteCallback } = require('./sessionStorage');

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: API_HOSTNAME, // **CRITICAL** must match API host
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: { storeCallback, loadCallback, deleteCallback },
});
module.exports = { shopify };
