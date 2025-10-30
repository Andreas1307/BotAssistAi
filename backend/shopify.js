// backend/shopify.js
require("@shopify/shopify-api/adapters/node");
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const { storeCallback, loadCallback, deleteCallback } = require("./sessionStorage");

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(","),
  hostName: "api.botassistai.com", // ✅ no protocol
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: { storeCallback, loadCallback, deleteCallback },
});

// ✅ Confirm it's ready
if (!shopify.session?.decodeSessionToken) {
  console.error("❌ Shopify session.decodeSessionToken not available — check adapter setup");
} else {
  console.log("✅ Shopify API initialized successfully");
}

module.exports = { shopify };
