// ✅ FIXED: Use the same session store Shopify uses
const { shopify, customSessionStorage } = require('./shopify');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await shopify.session.decodeSessionToken(token); // ✅ Works correctly now

    if (!payload) {
      console.error("❌ Decoded session token payload is null");
      return res.status(401).json({ error: 'Invalid session token payload' });
    }

    const shop = payload?.dest?.replace(/^https:\/\//, '').toLowerCase();
    if (!shop) {
      return res.status(401).json({ error: 'Invalid token payload (missing shop)' });
    }

    console.log("🔐 Decoded session token for shop:", shop);

    const sessions = await customSessionStorage.findSessionsByShop(shop); // ✅ FIXED
    console.log("📦 Matched stored sessions count:", sessions.length);

    if (sessions.length === 0) {
      console.warn("⚠️ No session found. Try re-authenticating or reinstalling the app.");
      return res.status(401).json({ error: 'Session not found or expired' });
    }

    req.shopify = {
      shop,
      session: sessions[0],
    };

    next();
  } catch (err) {
    console.error('❌ Session token validation failed:', err);
    return res.status(401).json({ error: 'Invalid session token' });
  }
};
