// conditionalVerifySessionToken.js
const verifySessionToken = require('./verifySessionToken');

module.exports = async function conditionalVerifySessionToken(req, res, next) {
  try {
    // Check if request has a Shopify session token header
    const authHeader = req.headers.authorization;

    // If header exists AND starts with Bearer → Shopify embedded call
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('🔒 Shopify embedded request detected, verifying session token...');
      return verifySessionToken(req, res, next);
    }

    // Otherwise → skip verification, it's a normal/non-Shopify request
    console.log('➡️ Non-Shopify request, skipping token verification...');
    return next();
  } catch (err) {
    console.error('Error in conditionalVerifySessionToken:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
