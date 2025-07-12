const { Shopify } = require('@shopify/shopify-api');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s/, '');

    const payload = await Shopify.Utils.decodeSessionToken(token);
    req.shop = payload.dest.replace('https://', '');
    next();
  } catch (err) {
    console.error('Invalid session token', err);
    return res.status(401).send('Unauthorized');
  }
};
