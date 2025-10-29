// verifySessionToken.js
const { shopify } = require("./shopify");
const customSessionStorage = require("./sessionStorage");

// helper to find decode function safely
function getDecodeFunction(shopify) {
  if (shopify?.auth?.decodeSessionToken) {
    return shopify.auth.decodeSessionToken;
  }

  try {
    // Shopify v11+ (official path)
    const { decodeSessionToken } = require("@shopify/shopify-api/runtime/auth");
    return (token) => decodeSessionToken(shopify.config.apiSecretKey, token);
  } catch (e) {
    console.warn("⚠️ decodeSessionToken not found in @shopify/shopify-api/runtime/auth, fallback disabled.");
    throw new Error("decodeSessionToken not available in this Shopify API version");
  }
}

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const decode = getDecodeFunction(shopify);

      try {
        const payload = await decode(token);
        if (!payload) throw new Error("Invalid JWT payload");

        const shop = payload.dest.replace(/^https:\/\//, "").toLowerCase();
        const onlineSessionId = `${shop}_${payload.sub}`;
        const offlineSessionId = `offline_${shop}`;

        const session =
          (await customSessionStorage.loadCallback(onlineSessionId)) ||
          (await customSessionStorage.loadCallback(offlineSessionId));

        if (session) {
          req.shopify = { shop, session, payload };
          console.log("✅ Shopify session validated via JWT:", shop);
          return next();
        }

        console.warn("⚠️ No session found for JWT payload — maybe not stored yet");
        return res.status(401).send("Session expired or invalid.");
      } catch (err) {
        console.warn("⚠️ Invalid or expired JWT:", err.message);
        return res.status(401).send("Invalid Shopify session token.");
      }
    }

    console.log("ℹ️ No Shopify session token — treating as external user");
    req.shopify = null;
    return next();
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    req.shopify = null;
    next();
  }
};
