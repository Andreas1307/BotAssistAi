// 1️⃣ Node adapter first
require('@shopify/shopify-api/adapters/node');

const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { storeCallback, loadCallback, deleteCallback } = require('./sessionStorage');

// 2️⃣ Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.HOST.replace(/^https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: { storeCallback, loadCallback, deleteCallback },
});

// 3️⃣ Use shopify.auth instance for session token decoding
// Example usage in verifySessionToken.js:
// const payload = await shopify.auth.decodeSessionToken(token);

console.log("✅ Shopify initialized with version:", LATEST_API_VERSION);
console.log("Has shopify.auth.decodeSessionToken:", typeof shopify.auth?.decodeSessionToken === 'function');

module.exports = { shopify };
