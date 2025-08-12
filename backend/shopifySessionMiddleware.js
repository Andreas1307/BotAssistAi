const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

function shopifySessionMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '');

  // Decode without verifying just to read the `iss`
  let decodedHeader;
  try {
    decodedHeader = jwt.decode(token, { complete: true });
  } catch {
    return res.status(401).send('Invalid token format');
  }

  if (!decodedHeader?.payload?.iss) {
    return res.status(401).send('Missing issuer in token');
  }

  const issuer = decodedHeader.payload.iss; // e.g. "https://mystore.myshopify.com/admin"
  const jwksUri = issuer.replace('/admin', '/.well-known/jwks.json');

  const client = jwksClient({ jwksUri });

  function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);
      callback(null, key.getPublicKey());
    });
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.SHOPIFY_API_KEY,
      issuer,
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        console.error('❌ Invalid Shopify session token:', err.message);
        return res.status(401).send('Unauthorized Shopify request');
      }
      req.shopifySession = decoded;
      next();
    }
  );
}

module.exports = shopifySessionMiddleware;
