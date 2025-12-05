const jwt = require('jsonwebtoken');
const { loadCallback } = require('./sessionStorage');

module.exports = async function verifySessionToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    req.shopify = null;
    return next();
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.SHOPIFY_API_SECRET, { algorithms: ['HS256'] });
    if (!payload.dest) {
      req.shopify = null;
      return next();
    }

    const shop = payload.dest.replace(/^https:\/\//, '').toLowerCase();
    const onlineSessionId = payload.sub ? `online_${shop}_${payload.sub}` : null;
    const offlineSessionId = `offline_${shop}`;

    let session = onlineSessionId ? await loadCallback(onlineSessionId) : undefined;
    if (!session) session = await loadCallback(offlineSessionId);

    if (!session) {
      console.warn('⚠️ No session found for JWT payload:', onlineSessionId, offlineSessionId);
      return res.status(401).json({ user: null, error: 'Session expired or invalid.' });
    }

    req.shopify = { shop, session, payload };
    next();
  } catch (err) {
    console.warn('❌ Invalid Shopify session token:', err.message);
    return res.status(401).json({ user: null, error: 'Invalid Shopify session token.' });
  }
};
