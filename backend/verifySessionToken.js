const { shopify } = require('./shopify');
const customSessionStorage = require('./sessionStorage');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // If no token, assume non-Shopify user → skip validation
    if (!authHeader?.startsWith('Bearer ')) {
      console.log("ℹ️ No Shopify token present — continuing as non-Shopify user");
      return next();
    }

    // Decode and validate Shopify session token
    const token = authHeader.replace('Bearer ', '');
    const payload = await shopify.session.decodeSessionToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid Shopify session token payload' });
    }

    const shop = payload.dest?.replace(/^https:\/\//, '').toLowerCase();
    if (!shop) {
      return res.status(401).json({ error: 'Invalid Shopify token (missing shop)' });
    }

    const sessionId = `${shop}_${payload.sub}`;
    const session = await customSessionStorage.loadCallback(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Shopify session not found' });
    }

    // Attach Shopify info to request
    req.shopify = { shop, session };
    console.log("✅ Shopify session validated:", shop);
    return next();

  } catch (err) {
    console.error('❌ Shopify session token validation failed:', err);
    return res.status(401).json({ error: 'Invalid Shopify session token' });
  }
};
