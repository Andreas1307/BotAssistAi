const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');
require('dotenv').config();

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const hostName = process.env.HOST.replace(/^https?:\/\//, '').replace(/\/$/, '');

const shopify = shopifyApi({
  apiKey,
  apiSecretKey: apiSecret,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName,
  sessionStorage: {
    // Optional stub for legacy compatibility; not used in this fix
    storeSession: async () => true,
    loadSession: async () => undefined,
    deleteSession: async () => true,
    findSessionsByShop: async () => [],
  },
});

module.exports = { shopify };
