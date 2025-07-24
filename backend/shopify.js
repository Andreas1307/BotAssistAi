const { shopifyApi, LATEST_API_VERSION, MemorySessionStorage } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');
require('dotenv').config();

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const rawHost = process.env.HOST;

if (!apiKey || !apiSecret || !rawHost) {
  throw new Error('Missing required Shopify environment variables');
}

const hostName = rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '');

const sessionStorage = new MemorySessionStorage(); // ✅ FIXED

const shopify = shopifyApi({
  apiKey,
  apiSecretKey: apiSecret,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName,
  sessionStorage,
});

module.exports = { shopify, sessionStorage };
