const { shopifyApi } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');
const { storeCallback, loadCallback, deleteCallback } = require('./sessionStorage');

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: "api.botassistai.com", // no protocol
  apiVersion: "2025-04", // set a fixed v11-compatible version
  isEmbeddedApp: true,
  sessionStorage: { storeCallback, loadCallback, deleteCallback },
});

module.exports = { shopify };
