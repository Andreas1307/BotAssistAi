require('@shopify/shopify-api/adapters/node');
const { shopify } = require('./shopify');
const { shopifyApi } = require('@shopify/shopify-api'); // ✅ needed
const { decodeSessionToken } = shopifyApi; // ✅ correct
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
      // Try decoding JWT
      let payload = null;
      try {
        payload = decodeSessionToken(shopify.config.apiSecretKey, token);
      } catch {
        payload = null; // fallback to offline token
      }

      if (payload) {
        const shop = payload.dest.replace(/^https:\/\//, '').toLowerCase();
        const onlineSessionId = `${shop}_${payload.sub}`;
        const session =
          (await customSessionStorage.loadCallback(onlineSessionId)) ||
          (await customSessionStorage.loadCallback(`offline_${shop}`));
        if (session) {
          req.shopify = { shop, session, payload };
          console.log('✅ Shopify session validated via JWT:', shop);
          return next();
        }
      }

      // If not JWT, try offline session token
      const session = await customSessionStorage.loadCallbackByAccessToken(token);
      if (session) {
        req.shopify = { shop: session.shop, session, payload: null };
        console.log('✅ Shopify session validated via offline token:', session.shop);
        return next();
      }

      console.warn('⚠️ No session found for token');
      return res.status(401).send('Session expired or invalid.');
    } catch (err) {
      console.warn('⚠️ Invalid or expired Shopify session token:', err.message);
      return res.status(401).send('Invalid Shopify session token.');
    }
  } catch (err) {
    console.error('❌ Session verification failed:', err);
    req.shopify = null;
    next();
  }
};
