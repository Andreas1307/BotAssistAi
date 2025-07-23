const { shopify } = require('./shopify');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid authorization header.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");

    // You must pass the correct shop domain – extract it from query or headers
    const shop = req.query.shop || req.headers['x-shopify-shop-domain'];
    if (!shop) {
      console.error("❌ Shop domain not provided.");
      return res.status(400).json({ error: "Shop domain is required" });
    }

    const client = new shopify.api.clients.Rest({
      domain: shop,
      accessToken: token,
    });

    // Try a test request to validate the token
    await client.get({ path: 'shop' });

    res.locals.shopify = { accessToken: token, shop };
    next();
  } catch (err) {
    console.error("❌ Token validation failed:", err.message);
    return res.status(401).json({ error: "Invalid session" });
  }
};
