const { shopify } = require('./shopify');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid authorization header.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Attempt to use the token by creating a REST client
    const client = new shopify.api.clients.Rest({
      accessToken: token,
      domain: req.query.shop || req.body.shop || '',
    });

    // Make a dummy call to verify token validity
    await client.get({ path: 'shop' });

    res.locals.shopify = { accessToken: token, shop: req.query.shop };
    return next();
  } catch (err) {
    console.error("❌ Invalid session token:", err.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
