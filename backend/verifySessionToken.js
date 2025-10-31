require('@shopify/shopify-api/adapters/node'); // Node adapter

const { shopifyApi } = require('@shopify/shopify-api');
const { decodeSessionToken } = require('@shopify/shopify-api/runtime'); // ✅ Correct import
const { storeCallback, loadCallback, deleteCallback } = require('./sessionStorage');

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: "api.botassistai.com", // NO protocol
  apiVersion: "2025-04",
  isEmbeddedApp: true,
  sessionStorage: { storeCallback, loadCallback, deleteCallback },
});

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      req.shopify = null;
      return next();
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      // ✅ Decode JWT token correctly
      const payload = await decodeSessionToken(token);
      console.log("🪞 Decoded JWT payload:", payload);

      const shop = payload.dest.replace(/^https:\/\//, "").toLowerCase();
      const onlineSessionId = `${shop}_${payload.sub}`;
      const offlineSessionId = `offline_${shop}`;

      const session =
        (await loadCallback(onlineSessionId)) ||
        (await loadCallback(offlineSessionId));

      if (!session) {
        console.warn("⚠️ No session found for JWT payload");
        return res.status(401).send("Session expired or invalid.");
      }

      req.shopify = { shop, session, payload };
      console.log("✅ Shopify session validated via JWT:", shop);
      return next();
    } catch (err) {
      console.warn("❌ Invalid JWT:", err.message);
      return res.status(401).send("Invalid Shopify session token.");
    }
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    req.shopify = null;
    next();
  }
};

module.exports.shopify = shopify;
