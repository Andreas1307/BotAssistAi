const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');
require('dotenv').config();

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const rawHost = process.env.HOST;

if (!apiKey || !apiSecret || !rawHost) {
  throw new Error('Missing required Shopify environment variables');
}

const hostName = rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '');

// 👇 Minimal in-memory session storage (DB-free)
const memorySessionStore = new Map();

const sessionStorage = {
  storeSession: async (session) => {
    memorySessionStore.set(session.id, session);
    return true;
  },
  loadSession: async (id) => {
    return memorySessionStore.get(id) || undefined;
  },
  deleteSession: async (id) => {
    return memorySessionStore.delete(id);
  },
  findSessionsByShop: async (shop) => {
    return [...memorySessionStore.values()].filter(session => session.shop === shop);
  },
};

const shopify = shopifyApi({
  apiKey,
  apiSecretKey: apiSecret,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName,
  sessionStorage,
});

module.exports = { shopify, sessionStorage };
