const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://shopify.com/admin/oauth/jwks', // ✅ correct JWKS
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

function shopifySessionMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '');

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.SHOPIFY_API_KEY,
      issuer: 'https://shopify.com',
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        console.error('❌ Invalid Shopify session token:', err);
        return res.status(401).send('Unauthorized Shopify request');
      }
      req.shopifySession = decoded;
      next();
    }
  );
}

module.exports = shopifySessionMiddleware;
