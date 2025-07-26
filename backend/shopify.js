const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
require("@shopify/shopify-api/adapters/node");
require("dotenv").config();
const customSessionStorage = require("./sessionStorage"); // ✅ Point to the one file only

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName: process.env.HOST.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  sessionStorage: customSessionStorage,
});

module.exports = { shopify };
