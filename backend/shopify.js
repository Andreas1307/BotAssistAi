// shopify.js
require("@shopify/shopify-api/adapters/node"); // Must be FIRST — sets up Node adapter

const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const { storeCallback, loadCallback, deleteCallback } = require("./sessionStorage");

if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
  console.error("❌ Missing Shopify API environment variables");
}

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: (process.env.SHOPIFY_SCOPES || "read_products,write_products").split(","),
  hostName: (process.env.HOST || "api.botassistai.com").replace(/^https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: { storeCallback, loadCallback, deleteCallback },
});

module.exports = { shopify };
