const { shopifyApi, LATEST_API_VERSION, CustomSessionStorage } = require("@shopify/shopify-api");
require("@shopify/shopify-api/adapters/node");

const {
  storeCallback,
  loadCallback,
  deleteCallback
} = require("./sessionStorage");

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(","),
  hostName: process.env.HOST.replace(/https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: {
    storeSession: storeCallback,
    loadSession: loadCallback,
    deleteSession: deleteCallback,
  },
});


module.exports = { shopify };
