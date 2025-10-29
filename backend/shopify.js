// 1️⃣ Import Node adapter first
require('@shopify/shopify-api/adapters/node');

// 2️⃣ Import shopifyApi normally
const shopifyModule = require('@shopify/shopify-api');
const { storeCallback, loadCallback, deleteCallback } = require('./sessionStorage');

// 3️⃣ Initialize Shopify API
const shopify = shopifyModule.shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.HOST.replace(/^https?:\/\//, ''), // remove protocol
  apiVersion: shopifyModule.LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: { storeCallback, loadCallback, deleteCallback },
});

// 4️⃣ Export auth explicitly
const auth = shopifyModule.auth;

console.log("✅ Shopify initialized with version:", shopifyModule.LATEST_API_VERSION);
console.log("Has decodeSessionToken:", auth?.decodeSessionToken ? true : false);

module.exports = { shopify, auth };
 sa updatez