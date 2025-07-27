const { shopifyApi, LATEST_API_VERSION, LogSeverity } = require("@shopify/shopify-api");
const customSessionStorage = require("./sessionStorage");

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(","),
  hostName: process.env.HOST.replace(/https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: customSessionStorage, // ✅ this must be here
  logger: { level: LogSeverity.Debug },
});

module.exports = { shopify };
