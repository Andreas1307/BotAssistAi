const { shopify } = require("./shopify");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid authorization header.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Decode and verify the session token (App Bridge JWT)
    const payload = await shopify.session.decodeSessionToken(token);

    const shop = payload.dest?.replace(/^https:\/\//, "");

    if (!shop) {
      console.error("❌ No shop found in token payload");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Rebuild a temporary custom app session
    const session = shopify.api.session.customAppSession(shop);

    // Attach session + token to request for downstream use
    req.shopify = { shop, token, session };

    next();
  } catch (err) {
    console.error("❌ Token validation failed:", err.message);
    return res.status(401).json({ error: "Invalid session" });
  }
};
