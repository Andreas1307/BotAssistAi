const { shopify, customSessionStorage } = require("./shopify");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await shopify.session.decodeSessionToken(token);
    const shop = payload.dest?.replace(/^https:\/\//, "").toLowerCase();

    console.log("🔐 Verifying session for shop:", shop);

    const sessions = await customSessionStorage.findSessionsByShop(shop);
    if (sessions.length === 0) {
      console.warn("⚠️ No session found for shop:", shop);
      return res.status(401).json({ error: "Session not found or expired" });
    }

    req.shopify = { shop, session: sessions[0] };
    next();
  } catch (err) {
    console.error("❌ verifySessionToken failed:", err);
    res.status(401).json({ error: "Invalid session token" });
  }
};
