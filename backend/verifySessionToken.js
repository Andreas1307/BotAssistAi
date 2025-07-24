const { shopify } = require('./shopify');

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
    const shop = shopDomain;

    if (!shop) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // ✅ Rebuild a session object manually (no DB needed)
    const session = {
      id: `offline_${shop}`,
      shop,
      isOnline: true,
      accessToken: token, // Using JWT as accessToken
    };

    req.shopify = { session };
    next();
  } catch (err) {
    console.error('❌ Session token validation failed:', err);
    return res.status(401).json({ error: 'Invalid session token' });
  }
};
