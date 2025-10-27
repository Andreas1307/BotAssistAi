const { shopify } = require('./shopify');
const customSessionStorage = require('./sessionStorage');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // First, check header
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const payload = await shopify.session.decodeSessionToken(token);
      if (!payload) return res.status(401).json({ error: 'Invalid Shopify session token' });

      const shop = payload.dest?.replace(/^https:\/\//, '').toLowerCase();
      const sessionId = `${shop}_${payload.sub}`;
      const session = await customSessionStorage.loadCallback(sessionId);
      if (!session) return res.status(401).json({ error: 'Shopify session not found' });

      req.shopify = { shop, session };
      console.log("✅ Shopify session validated via header:", shop);
      return next();
    }

    // Next, fallback: check embedded app session cookie (online session)
    if (req.cookies?.shopify_online_session) {
      const token = req.cookies.shopify_online_session;
      const payload = await shopify.session.decodeSessionToken(token);
      if (payload) {
        const shop = payload.dest?.replace(/^https:\/\//, '').toLowerCase();
        const sessionId = `${shop}_${payload.sub}`;
        const session = await customSessionStorage.loadCallback(sessionId);
        if (session) {
          req.shopify = { shop, session };
          console.log("✅ Shopify session validated via cookie:", shop);
          return next();
        }
      }
    }

    // Otherwise, treat as non-Shopify user
    console.log("ℹ️ No Shopify token present — continuing as non-Shopify user");
    return next();

  } catch (err) {
    console.error('❌ Shopify session token validation failed:', err);
    return res.status(401).json({ error: 'Invalid Shopify session token' });
  }
};

