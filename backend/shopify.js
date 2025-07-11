const { shopifyApi, LATEST_API_VERSION, MemorySessionStorage } = require('@shopify/shopify-api');
// Import the Node.js runtime adapter
const { node } = require('@shopify/shopify-api/dist/runtime/node');

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.HOST.replace(/^https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: MemorySessionStorage,  // no "new"
  runtime: node,  // Add the runtime adapter here
});

module.exports = shopify;
