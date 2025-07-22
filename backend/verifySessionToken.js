// middleware/verifySessionToken.js
const { shopify } = require('./shopify');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.replace(/^Bearer\s/, "");

    // 🛡️ Validate the token using Shopify
    const session = await shopify.auth.validateAuthenticatedSession(token);

    if (!session || !session.shop || !session.accessToken) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    res.locals.shopify = { session };
    return next();
  } catch (err) {
    console.error("❌ Error verifying session token:", err.message);
    return res.status(401).json({ error: "Session token invalid" });
  }
};
