const { shopifyApi, LATEST_API_VERSION, LogSeverity } = require("@shopify/shopify-api");
require('@shopify/shopify-api/adapters/node');

const customSessionStorage = require("./sessionStorage");

if (!process.env.SHOPIFY_SCOPES) {
  throw new Error("❌ Missing SCOPES in environment variables.");
}

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(","),
  hostName: process.env.HOST.replace(/https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: customSessionStorage,
});


module.exports = { shopify };
