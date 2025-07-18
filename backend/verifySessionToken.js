// middleware/verify-session-token.js ✅
const { Shopify } = require('@shopify/shopify-api');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s/, '');

    const payload = await Shopify.Utils.decodeSessionToken(token);
    const shop = payload.dest.replace('https://', '');

    // OPTIONAL: Store token/session for real use
    req.shop = shop;
    res.locals.shopify = {
      session: {
        shop,
        accessToken: process.env.SHOPIFY_ADMIN_TOKEN, // <-- use private token here
      },
    };

    next();
  } catch (err) {
    console.error('Invalid session token', err);
    return res.status(401).send('Unauthorized');
  }
};
