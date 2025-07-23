const { Shopify, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { SQLiteSessionStorage } = require('@shopify/shopify-app-session-storage-sqlite');
require('@shopify/shopify-api/adapters/node');

// Create sessionStorage instance before use
const sessionStorage = new SQLiteSessionStorage('./shopify_sessions.sqlite');

const shopify = new Shopify({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.HOST.replace(/^https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage,  // now defined!
});

module.exports = { shopify, sessionStorage };
