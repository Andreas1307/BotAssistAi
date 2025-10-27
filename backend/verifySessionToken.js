const { shopify } = require('./shopify');
const customSessionStorage = require('./sessionStorage');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await shopify.session.decodeSessionToken(token); // ✅ ensure await

    if (!payload || !payload.dest || !payload.sub) {
      return res.status(401).json({ error: 'Invalid session token payload' });
    }

    const shop = payload.dest.replace(/^https:\/\//, '').toLowerCase();
    const sessionId = `${shop}_${payload.sub}`; // ✅ must match your storage key format

    const session = await customSessionStorage.loadCallback(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Session not found' });
    }

    req.shopify = { shop, session };
    next();
  } catch (err) {
    console.error('❌ Session token validation failed:', err);
    res.status(401).json({ error: 'Invalid session token' });
  }
};
