// middleware/verify-session-token.js
const { Shopify } = require('@shopify/shopify-api');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);

    if (!session || !session.accessToken) {
      return res.status(401).send("Unauthorized");
    }

    res.locals.shopify = { session };
    req.shop = session.shop;
    next();
  } catch (err) {
    console.error("❌ Failed to validate session token:", err);
    return res.status(401).send("Unauthorized");
  }
};
