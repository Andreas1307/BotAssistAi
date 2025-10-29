const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: "api.botassistai.com",
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: { storeCallback, loadCallback, deleteCallback },
});

module.exports = { shopify };
