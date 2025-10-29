require('@shopify/shopify-api/adapters/node');
const { decodeSessionToken } = require('@shopify/shopify-api');
const { shopify } = require('./shopify');
const customSessionStorage = require('./sessionStorage');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('ℹ️ No Shopify session token — treating as external user');
      req.shopify = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = decodeSessionToken(shopify.config.apiSecretKey, token);
      if (!payload) throw new Error('Invalid JWT payload');

      const shop = payload.dest.replace(/^https:\/\//, '').toLowerCase();
      const onlineSessionId = `${shop}_${payload.sub}`;
      const offlineSessionId = `offline_${shop}`;

      const session = await customSessionStorage.loadCallbackByAccessToken(token);

      if (session) {
        req.shopify = { shop: session.shop, session, payload: null };
        console.log('✅ Shopify session validated via JWT:', shop);
        return next();
      }

      console.warn('⚠️ No session found for JWT payload');
      return res.status(401).send('Session expired or invalid.');
    } catch (err) {
      console.warn('⚠️ Invalid or expired JWT:', err.message);
      return res.status(401).send('Invalid Shopify session token.');
    }
  } catch (err) {
    console.error('❌ Session verification failed:', err);
    req.shopify = null;
    next();
  }
};
