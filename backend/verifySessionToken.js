// --- verifySessionToken.js ---
const { shopify, customSessionStorage } = require("./shopify");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      console.warn("⚠️ Missing or invalid authorization header");
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = header.slice(7);
    const payload = await shopify.session.decodeSessionToken(token);
    const shop = payload.dest?.replace(/^https?:\/\//, "").toLowerCase();

    console.log("🔐 Decoded session for shop:", shop);

    const sessions = await customSessionStorage.findSessionsByShop(shop);
    console.log("📦 Loaded sessions for shop:", sessions.length);

    if (!sessions || sessions.length === 0) {
      return res.status(401).json({ error: "Session not found or expired" });
    }

    req.shopify = { shop, session: sessions[0] };
    next();
  } catch (err) {
    console.error("❌ verifySessionToken error:", err);
    return res.status(401).json({ error: "Invalid session token" });
  }
};
