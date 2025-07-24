const { shopify, sessionStorage } = require("./shopify");
const { getSessionId } = require('@shopify/shopify-api');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid authorization header.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await shopify.session.decodeSessionToken(token);

    const shop = payload.shop; // ✅ Use .shop instead of dest
    if (!shop) {
      console.error("❌ No shop found in token payload");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sessionId = getSessionId({ isOnline: true, shop });
    console.log("🔍 Looking for session with ID:", sessionId);

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
