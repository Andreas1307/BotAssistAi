// verifySessionToken.js
const { shopify } = require("./shopify");
const customSessionStorage = require("./sessionStorage");

let decodeSessionTokenFn;

// 🧠 Safe dynamic import
try {
  const { decodeSessionToken } = require("@shopify/shopify-api/runtime/auth");
  decodeSessionTokenFn = decodeSessionToken;
  console.log("✅ Using decodeSessionToken from runtime/auth");
} catch (err) {
  console.warn("⚠️ decodeSessionToken not found in @shopify/shopify-api/runtime/auth");
}

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      if (!decodeSessionTokenFn) {
        console.error("❌ decodeSessionToken function unavailable — cannot verify token");
        return res.status(500).send("Shopify auth not properly configured");
      }

      try {
        // ✅ decode JWT with secret key
        const payload = await decodeSessionTokenFn(shopify.config.apiSecretKey, token);

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
