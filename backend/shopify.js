require('dotenv').config();

// 🧩 Import Node adapter for Shopify API (this is mandatory!)
require('@shopify/shopify-api/adapters/node');

const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { MemorySessionStorage } = require('@shopify/shopify-app-session-storage-memory');

const sessionStorage = new MemorySessionStorage();

// ✅ Validate required env vars
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const rawHost = process.env.HOST;

if (!apiKey) throw new Error('Missing environment variable: SHOPIFY_API_KEY');
if (!apiSecret) throw new Error('Missing environment variable: SHOPIFY_API_SECRET');
if (!rawHost) throw new Error('Missing environment variable: HOST');

// 🚫 Strip protocol & trailing slashes
const hostName = rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '');

const shopify = shopifyApi({
  apiKey,
  apiSecretKey: apiSecret,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName,
  sessionStorage,
});

module.exports = { shopify, sessionStorage };
