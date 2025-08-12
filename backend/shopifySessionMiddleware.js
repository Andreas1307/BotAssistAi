const jwt = require('jsonwebtoken');

function shopifySessionMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  const token = authHeader.replace('Bearer ', '');

  let decodedHeader;
  try {
    decodedHeader = jwt.decode(token, { complete: true });
  } catch {
    return res.status(401).send('Invalid token format');
  }

  if (!decodedHeader?.payload?.iss) {
    return res.status(401).send('Missing issuer in token');
  }

  const issuer = decodedHeader.payload.iss;

  console.log('Token alg:', decodedHeader.header.alg);
  console.log('Token payload:', decodedHeader.payload);

  if (decodedHeader.header.alg !== 'HS256') {
    return res.status(401).send('Invalid token algorithm');
  }

  jwt.verify(
    token,
    process.env.SHOPIFY_API_SECRET,  // Use the client secret for HS256
    {
      audience: process.env.SHOPIFY_API_KEY,
      issuer,
      algorithms: ['HS256'],  // HS256 algorithm
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
