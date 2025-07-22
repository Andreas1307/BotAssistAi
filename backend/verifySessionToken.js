// middleware/verify-session-token.js

const { Shopify } = require("@shopify/shopify-api");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.replace(/^Bearer\s/, "");

    // ✅ Decode the session token (JWT)
    const payload = await Shopify.Auth.JWT.decodeSessionToken(token);

    const shop = payload.dest.replace(/^https:\/\//, ""); // get shop domain from token
    const session = await Shopify.Session.Storage.findByShop(shop);

    if (!session || !session.accessToken) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    res.locals.shopify = { session };
    return next();
  } catch (err) {
    console.error("❌ Error verifying session token:", err.message);
    return res.status(401).json({ error: "Session token invalid" });
  }
};
