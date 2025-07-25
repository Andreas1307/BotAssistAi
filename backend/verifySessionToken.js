const { shopify } = require('./shopify');
const customSessionStorage = require('./sessionStorage');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await shopify.session.decodeSessionToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid session token payload' });
    }

    const shop = payload.dest?.replace(/^https:\/\//, '').toLowerCase();
    if (!shop) {
      return res.status(401).json({ error: 'Invalid token payload (missing shop)' });
    }

    const sessionId = `offline_${shop}`;
    console.log("🔍 Looking for session with ID:", sessionId);

    const session = await customSessionStorage.loadSession(sessionId);

    if (!session) {
      console.warn("⚠️ Session not found for shop:", shop);
      return res.status(401).json({ error: 'Session not found' });
    }

    req.shopify = {
      shop,
      session,
    };

    next();
  } catch (err) {
    console.error('❌ Session token validation failed:', err);
    return res.status(401).json({ error: 'Invalid session token' });
  }
};
