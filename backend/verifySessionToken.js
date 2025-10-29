const { shopify } = require('./shopify');
const { loadCallback } = require('./sessionStorage');

async function verifyShopifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      req.shopify = null; // external user
      return next();
    }

    const sessionId = await shopify.session.getCurrentId({
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    if (!sessionId) return res.status(401).send('Invalid Shopify session token');

    const session = await loadCallback(sessionId);
    if (!session) return res.status(401).send('Session expired or not found');

    req.shopify = { shop: session.shop, session };
    next();
  } catch (err) {
    console.error('❌ Shopify token verification failed:', err.message);
    res.status(401).send('Invalid Shopify session token');
  }
}

module.exports = verifyShopifyToken;
