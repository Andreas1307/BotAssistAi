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
    if (!sessions?.length || !sessions[0].accessToken) {
      return res.status(401).json({ error: 'No valid access token found for this shop' });
    }

    req.shopify = {
      session: sessions[0], // this includes accessToken
    };

    next();
  } catch (err) {
    console.error('❌ Session token validation failed:', err);
    return res.status(401).json({ error: 'Invalid session token' });
  }
};
