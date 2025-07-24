const { shopify, customSessionStorage } = require('./shopify');

module.exports = async function verifySessionToken(req, res, next) {
  try {
    console.log("🔍 Verifying session token...");

    const authHeader = req.headers.authorization;
    console.log("📥 Authorization header:", authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      console.warn("⚠️ Missing or invalid authorization header");
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log("🔑 Extracted token:", token);

    const payload = await shopify.session.decodeSessionToken(token);
    console.log("📦 Decoded session token payload:", payload);

    if (!payload) {
      console.error("❌ Decoded session token payload is null");
      return res.status(401).json({ error: 'Invalid session token payload' });
    }

    const shop = payload?.dest?.replace(/^https:\/\//, '').toLowerCase();
    console.log("🏷 Shop extracted from token payload:", shop);

    if (!shop) {
      console.warn("⚠️ Token payload missing shop domain");
      return res.status(401).json({ error: 'Invalid token payload (missing shop)' });
    }

    const sessions = await customSessionStorage.findSessionsByShop(shop);
    console.log(`📦 Found ${sessions.length} session(s) for shop ${shop}`);

    if (sessions.length === 0) {
      console.warn("⚠️ No session found for shop, user must re-authenticate");
      return res.status(401).json({ error: 'Session not found or expired' });
    }

    req.shopify = {
      shop,
      session: sessions[0],
    };

    console.log("✅ Session verified, proceeding to next middleware");
    next();
  } catch (err) {
    console.error('❌ Session token validation failed:', err);
    return res.status(401).json({ error: 'Invalid session token' });
  }
};
