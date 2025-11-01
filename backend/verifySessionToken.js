require('@shopify/shopify-api/adapters/node');
const jwt = require('jsonwebtoken'); 
const { loadCallback } = require('./sessionStorage');

module.exports = async function verifySessionToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    req.shopify = null;
    return next();
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('🧾 Received token:', token.slice(0, 25) + '...');

  try {
    // ✅ Decode and verify Shopify JWT
    const payload = jwt.verify(token, process.env.SHOPIFY_API_SECRET, {
      algorithms: ['HS256'],
    });

    console.log('🪞 Decoded JWT payload:', payload);

    const shop = payload.dest.replace(/^https:\/\//, '').toLowerCase();
    const onlineSessionId = `${shop}_${payload.sub}`;
    const offlineSessionId = `offline_${shop}`;

    const session =
      (await loadCallback(onlineSessionId)) ||
      (await loadCallback(offlineSessionId));

    if (!session) {
      console.warn('⚠️ No session found for JWT payload');
      return res.status(401).send('Session expired or invalid.');
    }

    req.shopify = { shop, session, payload };
    console.log('✅ Shopify session validated via JWT:', shop);
    next();
  } catch (err) {
    console.warn('❌ Invalid Shopify session token:', err.message);
    return res.status(401).send('Invalid Shopify session token.');
  }
};