require('@shopify/shopify-api/adapters/node');
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const customSessionStorage = require("./sessionStorage");

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(","),
  hostName: process.env.HOST.replace(/^https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: customSessionStorage,
});

module.exports = { shopify };
