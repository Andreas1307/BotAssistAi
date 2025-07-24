const { shopify } = require('./shopify');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await shopify.session.decodeSessionToken(token);
    const shop = payload.shop || payload.dest?.replace(/^https:\/\//, '');

    if (!shop) {
      return res.status(401).json({ error: "Invalid session token" });
    }

    const sessions = await shopify.sessionStorage.findSessionsByShop(shop);
    const session = sessions?.[0];

    if (!session || !session.accessToken) {
      return res.status(401).json({ error: "Session expired or missing" });
    }

    req.shopify = { shop, session };
    next();
  } catch (err) {
    console.error("❌ Session validation failed:", err);
    return res.status(401).json({ error: "Invalid session" });
  }
};
