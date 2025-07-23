const { shopify } = require("./shopify");
const { decodeSessionToken } = require('@shopify/shopify-api/lib/auth/session/token-decode');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid authorization header.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await decodeSessionToken(token);
    const shop = payload.dest.replace(/^https:\/\//, "");

    if (!shop) {
      console.error("❌ No shop found in token payload");
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.shopify = { shop, token };
    next();
  } catch (err) {
    console.error("❌ Token validation failed:", err.message);
    return res.status(401).json({ error: "Invalid session" });
  }
};
