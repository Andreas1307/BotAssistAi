// backend/shopify.js
require("@shopify/shopify-api/adapters/node");
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const sessionStorage = require("./sessionStorage");

// ✅ Initialize Shopify API instance
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES?.split(",") || [],
  hostName: process.env.HOST?.replace(/^https?:\/\//, "") || "api.botassistai.com",
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage,
});

module.exports = { shopify };
