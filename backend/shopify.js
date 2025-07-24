require('dotenv').config();

const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { MemorySessionStorage } = require('@shopify/shopify-app-session-storage-memory');

const sessionStorage = new MemorySessionStorage();

const rawHost = process.env.HOST;
if (!rawHost) {
  throw new Error('Missing required environment variable: HOST');
}

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName: rawHost.replace(/^https:\/\//, ''), // e.g. api.botassistai.com
  sessionStorage,
});

module.exports = { shopify, sessionStorage };
