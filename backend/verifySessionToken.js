const { customSessionStorage } = require("./shopify");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const shop = req.headers["x-shopify-shop-domain"]?.toLowerCase();

    if (!token || !shop) {
      console.warn("❌ Missing token or shop header");
      return res.status(401).json({ error: "Missing token or shop domain" });
    }

    console.log("🔐 Verifying token for shop:", shop);

    const sessions = await customSessionStorage.findSessionsByShop(shop);
    console.log("📦 Found sessions:", sessions.length);

    if (!sessions || sessions.length === 0) {
      console.warn("⚠️ No session found for shop:", shop);
      return res.status(401).json({ error: "Session not found or expired" });
    }

    req.shopify = { shop, session: sessions[0] };
    next();
  } catch (err) {
    console.error("❌ verifySessionToken error:", err);
    return res.status(401).json({ error: "Token verification failed" });
  }
};
