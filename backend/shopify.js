const { Shopify } = require("@shopify/shopify-api");

const shopify = new Shopify({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(","),
  hostName: process.env.HOST.replace(/https?:\/\//, ""),
  apiVersion: "2025-07",
  isEmbeddedApp: true,
  sessionStorage: require("./sessionStorage"), // your session storage module
});

module.exports = { shopify };
