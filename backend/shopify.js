// 1️⃣ Node adapter first
require('@shopify/shopify-api/adapters/node');

// 2️⃣ Import shopifyApi + auth normally
const { shopifyApi, auth, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { storeCallback, loadCallback, deleteCallback } = require('./sessionStorage');

// 3️⃣ Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.HOST.replace(/^https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: { storeCallback, loadCallback, deleteCallback },
});

// 4️⃣ Debug
console.log("✅ Shopify initialized with version:", LATEST_API_VERSION);
console.log("Has decodeSessionToken:", typeof auth.decodeSessionToken === 'function');

module.exports = { shopify, auth };
