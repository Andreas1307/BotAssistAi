const { shopify, sessionStorage } = require("./shopify");
const { getOnlineSessionId } = require('@shopify/shopify-api'); // ✅ FIXED

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid authorization header.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await shopify.session.decodeSessionToken(token);

    const shop = payload.shop || payload.dest?.replace(/^https:\/\//, '');
    if (!shop) {
      console.error("❌ No shop found in token payload");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sessionId = getOnlineSessionId(shop); // ✅ FIXED
    console.log("✅ Decoded shop from token:", shop);
    console.log("🔍 Looking for session ID:", sessionId);

    const session = await sessionStorage.loadSession(sessionId);
    if (!session || !session.accessToken) {
      console.error("❌ No valid stored session for shop:", shop);
      return res.status(401).json({ error: "Session expired or missing" });
    }

    req.shopify = { shop, session };
    next();
  } catch (err) {
    console.error("❌ Token validation failed:", err.message);
    return res.status(401).json({ error: "Invalid session" });
  }
};
