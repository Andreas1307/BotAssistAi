// shopify.js
require('@shopify/shopify-api/adapters/node'); // Important: adapter first
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { storeCallback, loadCallback, deleteCallback } = require('./sessionStorage');

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.HOST.replace(/^https?:\/\//, ''), // must not have https://
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: {
    storeCallback,
    loadCallback,
    deleteCallback,
  },
});

module.exports = { shopify };
