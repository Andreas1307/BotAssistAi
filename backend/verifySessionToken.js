const jwt = require('jsonwebtoken');
const { shopify, sessionStorage } = require('./shopify');

function verifyJWT(token) {
  return jwt.verify(token, process.env.SHOPIFY_API_SECRET);
}

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.replace(/^Bearer\s/, "");
    const payload = verifyJWT(token); // <-- verifies signature

    if (!payload || !payload.dest || !payload.sub) {
      throw new Error("Invalid token payload");
    }

    const shop = payload.dest.replace(/^https:\/\//, "");
    const sessionId = shopify.session.getJwtSessionId(shop, payload.sub);
    const session = await sessionStorage.loadSession(sessionId);

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
