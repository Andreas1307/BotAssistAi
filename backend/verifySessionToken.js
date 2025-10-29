require('@shopify/shopify-api/adapters/node'); // ensure correct adapter
const { shopify } = require('./shopify');
const customSessionStorage = require('./sessionStorage');
const { jwtDecode } = require('@shopify/shopify-api/runtime'); // ✅ supported API
const crypto = require('crypto');

async function verifyJWT(token, secret) {
  try {
    const payload = jwtDecode(token); // decode without verifying signature
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signatureB64 !== expectedSig) throw new Error('Invalid signature');
    if (payload.exp && Date.now() / 1000 > payload.exp) throw new Error('Token expired');
    return payload;
  } catch (err) {
    throw new Error(`JWT verification failed: ${err.message}`);
  }
}

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');

      try {
        const payload = await verifyJWT(token, shopify.config.apiSecretKey);
        if (!payload) throw new Error('Invalid JWT payload');

        const shop = payload.dest.replace(/^https:\/\//, '').toLowerCase();
        const onlineSessionId = `${shop}_${payload.sub}`;
        const offlineSessionId = `offline_${shop}`;

        const session =
          (await customSessionStorage.loadCallback(onlineSessionId)) ||
          (await customSessionStorage.loadCallback(offlineSessionId));

        if (session) {
          req.shopify = { shop, session, payload };
          console.log('✅ Shopify session validated via JWT:', shop);
          return next();
        }

        console.warn('⚠️ No session found for JWT payload');
        return res.status(401).send('Session expired or invalid.');
      } catch (err) {
        console.warn('⚠️ Invalid or expired JWT:', err.message);
        return res.status(401).send('Invalid Shopify session token.');
      }
    }

    console.log('ℹ️ No Shopify session token — treating as external user');
    req.shopify = null;
    next();
  } catch (err) {
    console.error('❌ Session verification failed:', err);
    req.shopify = null;
    next();
  }
};
