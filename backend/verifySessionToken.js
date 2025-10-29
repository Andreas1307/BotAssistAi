const { shopify } = require('./shopify');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const payload = await shopify.session.decodeSessionToken(token); // ✅ now works

      const shop = payload.dest.replace(/^https:\/\//, '').toLowerCase();
      const onlineSessionId = `${shop}_${payload.sub}`;
      const offlineSessionId = `offline_${shop}`;

      const session =
        (await customSessionStorage.loadCallback(onlineSessionId)) ||
        (await customSessionStorage.loadCallback(offlineSessionId));

      if (session) {
        req.shopify = { shop, session, payload };
        console.log('✅ Shopify session validated via JWT:', shop);
        return next();
      }

      console.warn('⚠️ No session found for JWT payload');
      return res.status(401).send('Session expired or invalid.');
    }

    console.log('ℹ️ No Shopify session token — treating as external user');
    req.shopify = null;
    next();
  } catch (err) {
    console.error('❌ Session verification failed:', err);
    req.shopify = null;
    next();
  }
};
