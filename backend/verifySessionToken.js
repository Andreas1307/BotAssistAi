const { shopify, decodeSessionToken } = require('./shopify');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid authorization header.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await decodeSessionToken(token);

    if (!payload?.dest) {
      console.error("❌ Token payload missing 'dest' property.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const shopDomain = payload.dest.replace(/^https?:\/\//, "");
    const session = await shopify.api.session.customAppSession(shopDomain);

    if (!session) {
      console.error("❌ Failed to create session for shop:", shopDomain);
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.locals.shopify = { session };
    return next();
  } catch (err) {
    console.error("❌ Session verification failed:", err.message);
    return res.status(401).json({ error: "Invalid session" });
  }
};
