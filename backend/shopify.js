const { shopifyApi, LATEST_API_VERSION, session } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName: process.env.HOST.replace(/^https?:\/\//, ''),
  sessionStorage: new session.MemorySessionStorage(), // ✅ In-memory
});

module.exports = { shopify, sessionStorage: shopify.config.sessionStorage };
