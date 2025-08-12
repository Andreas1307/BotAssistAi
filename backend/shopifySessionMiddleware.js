// shopifySessionMiddleware.js
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Shopify JWKS (public key endpoint)
const client = jwksClient({
  jwksUri: 'https://shopify.dev/api/jwt/jwks',
});

// Helper to get the public key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

function shopifySessionMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // If no Authorization header → not a Shopify iframe request
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '');

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.SHOPIFY_API_KEY,
      issuer: 'https://shopify.app',
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        console.error('❌ Invalid Shopify session token:', err);
        return res.status(401).send('Unauthorized Shopify request');
      }

      req.shopifySession = decoded; // decoded token payload
      next();
    }
  );
}

module.exports = shopifySessionMiddleware;
