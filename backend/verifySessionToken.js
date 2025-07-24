const { shopify, sessionStorage } = require('./shopify');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await shopify.session.decodeSessionToken(token);
    console.log('🪪 Token payload:', payload);

    const shopDomain = payload?.dest?.replace(/^https:\/\//, '').toLowerCase();
    if (!shopDomain) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const sessions = await sessionStorage.findSessionsByShop(shopDomain);
    console.log(`🔍 Found ${sessions.length} session(s) for ${shopDomain}`);

    const session = sessions[0];
    if (!session?.accessToken) {
      return res.status(401).json({ error: 'Session expired or missing' });
    }

    req.shopify = { shop: shopDomain, session };
    next();
  } catch (err) {
    console.error('❌ Session token validation failed:', err);
    return res.status(401).json({ error: 'Invalid session token' });
  }
};
