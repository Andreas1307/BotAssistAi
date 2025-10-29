// verifySessionToken.js
const { shopify } = require("./shopify");
const customSessionStorage = require("./sessionStorage");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Shopify Session Token (JWT)
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      try {
        const payload = await shopify.session.decodeSessionToken(token);
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

    // 2️⃣ Fallback for non-Shopify users or external access
    console.log("ℹ️ No Shopify session token — treating as external user");
    req.shopify = null;
    return next();
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    req.shopify = null;
    next();
  }
};
