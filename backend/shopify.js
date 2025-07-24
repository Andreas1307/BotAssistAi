require('dotenv').config();

const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { MemorySessionStorage } = require('@shopify/shopify-app-session-storage-memory');

const sessionStorage = new MemorySessionStorage();

// Validate env vars
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const rawHost = process.env.HOST;

if (!apiKey) throw new Error('Missing environment variable: SHOPIFY_API_KEY');
if (!apiSecret) throw new Error('Missing environment variable: SHOPIFY_API_SECRET');
if (!rawHost) throw new Error('Missing environment variable: HOST');

const hostName = rawHost.replace(/^https?:\/\//, '').replace(/\/$/, ''); // strip protocol and trailing slash

const shopify = shopifyApi({
  apiKey,
  apiSecretKey: apiSecret,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName,          // must be host without protocol
  sessionStorage,
});

module.exports = { shopify, sessionStorage };
