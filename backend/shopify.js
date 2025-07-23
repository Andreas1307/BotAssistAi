const { shopifyApi, LATEST_API_VERSION, decodeSessionToken } = require('@shopify/shopify-api');
const { SQLiteSessionStorage } = require('@shopify/shopify-app-session-storage-sqlite');
require('@shopify/shopify-api/adapters/node');

const sessionStorage = new SQLiteSessionStorage('./shopify_sessions.sqlite');

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.HOST.replace(/^https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage,
});

module.exports = { shopify, sessionStorage, decodeSessionToken };
