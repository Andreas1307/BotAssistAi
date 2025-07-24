const { shopify, sessionStorage } = require("./shopify");

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

    // 🔍 Load *any* valid session for this shop
    const sessions = await sessionStorage.findSessionsByShop(shop);

    const session = sessions?.[0];
    if (!session || !session.accessToken) {
      console.error("❌ No valid session found for shop:", shop);
      return res.status(401).json({ error: "Session expired or missing" });
    }

    req.shopify = { shop, session };
    next();
  } catch (err) {
    console.error("❌ Token validation failed:", err.message);
    return res.status(401).json({ error: "Invalid session" });
  }
};
