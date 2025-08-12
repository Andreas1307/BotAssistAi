const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

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
    const shopOrigin = issuer.replace('/admin', '');
    const jwksUri = `${shopOrigin}/.well-known/jwks.json`;
  
    console.log("🔑 JWKS URI:", jwksUri);
    console.log('Token kid:', decodedHeader.header.kid);
    console.log('Token alg:', decodedHeader.header.alg);
    console.log('Token payload:', decodedHeader.payload);
  
    const client = jwksClient({
      jwksUri,
      requestHeaders: {
        'User-Agent': 'Shopify App/1.0 (+https://yourappurl.com)',
      },
      cache: false,
      rateLimit: false,
    });
  
    function getKey(header, callback) {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          console.error('Error getting signing key:', err);
          return callback(err);
        }
        if (!key) {
          const errMsg = `No key found for kid: ${header.kid}`;
          console.error(errMsg);
          return callback(new Error(errMsg));
        }
        const publicKey = key.getPublicKey();
        console.log('Using public key for kid:', header.kid);
        callback(null, publicKey);
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
