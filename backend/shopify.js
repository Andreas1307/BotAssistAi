// shopify.js
const { shopifyApi, LATEST_API_VERSION, Shopify } = require('@shopify/shopify-api');
const { restResources } = require('@shopify/shopify-api/rest/admin/2023-10');
const { setRestClient } = require('@shopify/shopify-api/lib/clients/rest'); // optional

// ✅ Make sure to explicitly set the adapter FIRST
Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SHOPIFY_SCOPES.split(','),
  HOST_NAME: "api.botassistai.com", // no protocol
  IS_EMBEDDED_APP: true,
  API_VERSION: LATEST_API_VERSION,
  SESSION_STORAGE: require('./sessionStorage'),
});

// ✅ Export API instance
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: "api.botassistai.com",
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: require('./sessionStorage'),
});

module.exports = { shopify };
