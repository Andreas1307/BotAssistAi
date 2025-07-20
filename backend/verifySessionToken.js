// middleware/verify-session-token.js

const { Shopify } = require("@shopify/shopify-api");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);

    if (!session || !session.accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.locals.shopify = { session };
    next();
  } catch (err) {
    console.error("❌ Error verifying token:", err);
    return res.status(401).json({ error: "Session token invalid" });
  }
};
