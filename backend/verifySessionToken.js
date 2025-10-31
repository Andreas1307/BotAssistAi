const { Shopify } = require("@shopify/shopify-api");
const customSessionStorage = require("./sessionStorage");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      try {
        // v11: decodeJwt instead of decodeSessionToken
        const payload = Shopify.Utils.decodeJwt(token, process.env.SHOPIFY_API_SECRET);
        if (!payload) throw new Error("Invalid JWT payload");

        const shop = payload.dest.replace(/^https:\/\//, "").toLowerCase();
        const onlineSessionId = `${shop}_${payload.sub}`;
        const offlineSessionId = `offline_${shop}`;

        const session =
          (await customSessionStorage.loadCallback(onlineSessionId)) ||
          (await customSessionStorage.loadCallback(offlineSessionId));

        if (!session) {
          console.warn("⚠️ No session found for JWT payload");
          return res.status(401).send("Session expired or invalid.");
        }

        req.shopify = { shop, session, payload };
        console.log("✅ Shopify session validated via JWT:", shop);
        return next();
      } catch (err) {
        console.warn("⚠️ Invalid JWT:", err.message);
        return res.status(401).send("Invalid Shopify session token.");
      }
    }

    // No token: treat as external user
    req.shopify = null;
    next();
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    req.shopify = null;
    next();
  }
};