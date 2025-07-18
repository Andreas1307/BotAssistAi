// middleware/verify-session-token.js
const { Shopify } = require('@shopify/shopify-api');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s/, '');

    if (!token) {
      return res.status(401).send("Missing session token");
    }

    const payload = await Shopify.Utils.decodeSessionToken(token);

    const shop = payload.dest.replace(/^https:\/\//, "");

    res.locals.shopify = {
      session: {
        shop,
        accessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN, // for private apps or test tokens
      },
    };

    req.shop = shop;
    next();
  } catch (err) {
    console.error("❌ Invalid session token", err);
    return res.status(401).send("Unauthorized");
  }
};
