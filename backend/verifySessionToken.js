const { shopify } = require("./shopify");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await shopify.session.decodeSessionToken(token);
    console.log("🪪 Token payload:", payload);

    const shopDomain = payload?.dest?.replace(/^https:\/\//, '').toLowerCase();
    if (!shopDomain) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // ✅ Just pass token + shop directly
    req.shopify = { shop: shopDomain, token };
    next();
  } catch (err) {
    console.error("❌ Session token validation failed:", err);
    return res.status(401).json({ error: "Invalid session token" });
  }
};
