const { shopifyApi, LATEST_API_VERSION, Webhook, DeliveryMethod } = require("@shopify/shopify-api");
require("@shopify/shopify-api/adapters/node");
const { storeCallback, loadCallback, deleteCallback } = require("./sessionStorage");

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(","),
  hostName: process.env.HOST.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: { storeCallback, loadCallback, deleteCallback },
});



shopify.webhooks.addHandlers({
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/shopify/uninstall", // matches your Express route
    callback: async (topic, shop, body) => {
      console.log("🪓 APP_UNINSTALLED webhook fired from Shopify handler:", shop);
      // You can optionally process the uninstall payload here too
    },
  },
});

module.exports = { shopify, Webhook };
