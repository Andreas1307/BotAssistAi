const { shopify, sessionStorage } = require('./shopify');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await shopify.session.decodeSessionToken(token);
    console.log("🪪 Token payload:", payload);


    const shopFromToken = payload?.shop || payload?.dest?.replace(/^https:\/\//, '').toLowerCase();
    if (!shopFromToken) {
      console.error("❌ No shop found in token");
      return res.status(401).json({ error: "Invalid session token" });
    }

    const sessions = await sessionStorage.findSessionsByShop(shopFromToken);
    const session = sessions?.[0];

    if (!session || !session.accessToken) {
      console.warn("❌ No valid session found for shop:", shopFromToken);
      return res.status(401).json({ error: "Session expired or missing" });
    }

    req.shopify = { shop: shopFromToken, session };
    next();
  } catch (err) {
    console.error("❌ Session validation failed:", err);
    return res.status(401).json({ error: "Invalid session" });
  }
};
