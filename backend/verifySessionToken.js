const { shopify } = require('./shopify');
const customSessionStorage = require('./sessionStorage');

/**
 * Middleware to verify Shopify or non-Shopify users.
 * - Checks for a valid Bearer JWT in the header (for embedded requests)
 * - Falls back to a valid cookie containing the Shopify access token
 * - If neither found → continues as a non-Shopify user
 */
module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check Authorization header (Shopify App Bridge JWT)
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');

      try {
        const payload = await shopify.session.decodeSessionToken(token);
        if (!payload) throw new Error('Invalid JWT payload');

        const shop = payload.dest?.replace(/^https:\/\//, '').toLowerCase();
        const sessionId = `${shop}_${payload.sub}`;
        const session = await customSessionStorage.loadCallback(sessionId);

        if (!session) throw new Error('Session not found');

        req.shopify = { shop, session };
        console.log('✅ Shopify session validated via header:', shop);
        return next();
      } catch (err) {
        console.warn('⚠️ Invalid or expired Shopify JWT, falling back to cookie check');
      }
    }

    // 2️⃣ Fallback: validate via accessToken stored in cookie
    if (req.cookies?.shopify_online_session) {
      const accessToken = req.cookies.shopify_online_session;

      // Look up the session in your DB by accessToken
      const allSessions = await customSessionStorage.getAllSessions();
      const session = allSessions.find(s => s.accessToken === accessToken);

      if (session) {
        req.shopify = { shop: session.shop, session };
        console.log('✅ Shopify session validated via cookie:', session.shop);
        return next();
      }

      console.warn('⚠️ Cookie found but no matching session in storage');
    }

    // 3️⃣ No token or cookie → allow as non-Shopify user
    console.log('ℹ️ No Shopify token/cookie — treating as non-Shopify user');
    return next();

  } catch (err) {
    console.error('❌ Shopify session token validation failed:', err);
    return res.status(401).json({ error: 'Invalid or expired Shopify session token' });
  }
};
