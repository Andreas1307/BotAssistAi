require('@shopify/shopify-api/adapters/node');
const jwt = require('jsonwebtoken');
const { loadCallback } = require('./sessionStorage');

async function shopifySessionMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(); // Not a Shopify request
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // ✅ Decode and verify JWT using your Shopify app secret
    const payload = jwt.verify(token, process.env.SHOPIFY_API_SECRET, {
      algorithms: ['HS256'],
    });


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
    next();
  } catch (err) {
    console.error('❌ Invalid Shopify session token:', err.message);
    return res.status(401).send('Unauthorized Shopify request');
  }
}

module.exports = shopifySessionMiddleware;
