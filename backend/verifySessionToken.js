const jwt = require('jsonwebtoken'); 
const { loadCallback } = require('./sessionStorage');

module.exports = async function verifySessionToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Treat non-Shopify JWT calls (like your homepage) gracefully
    return next();
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.SHOPIFY_API_SECRET, {
      algorithms: ['HS256'],
    });

    if (!payload.dest) {
      req.shopify = null;
      return next();
    }

    const shop = payload.dest.replace(/^https:\/\//, '').toLowerCase();
    const onlineSessionId = `online_${shop}_${payload.sub}`; // ✅ Must match exactly how you saved it
    const offlineSessionId = `offline_${shop}`;

    const session =
      (await loadCallback(onlineSessionId)) ||
      (await loadCallback(offlineSessionId));

    if (!session) {
      console.warn('⚠️ No session found for JWT payload:', onlineSessionId, offlineSessionId);
      return res.status(401).json({ user: null, error: 'Session expired' });
    }

    req.shopify = { shop, session, payload };
    next();
  } catch (err) {
    console.warn('❌ Invalid Shopify session token:', err.message);
    return res.status(401).json({ user: null, error: 'Invalid token' });
  }
};
