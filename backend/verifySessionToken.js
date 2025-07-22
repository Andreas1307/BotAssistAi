const { Shopify } = require('@shopify/shopify-api');
const jwt = require('jsonwebtoken');

/**
 * Decode JWT manually if `decodeSessionToken` is unavailable.
 * Only for use in environments where Shopify.Auth.JWT is not available.
 */
function decodeJWT(token) {
  return jwt.decode(token);
}

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.replace(/^Bearer\s/, "");

    // 🔐 Decode the JWT payload
    const payload = decodeJWT(token);
    if (!payload || !payload.dest || !payload.sub) {
      throw new Error("Invalid token payload");
    }

    const shop = payload.dest.replace(/^https:\/\//, "");
    const sessionId = Shopify.Session.getJwtSessionId(shop, payload.sub);

    const session = await Shopify.Session.Storage.loadSession(sessionId);

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
