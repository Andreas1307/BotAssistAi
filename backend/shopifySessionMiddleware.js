const { shopify } = require("./shopify");

async function shopifySessionMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(); // allow non-Shopify requests to continue
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Decode and verify the JWT from App Bridge
    const payload = await shopify.auth.sessionToken.decodeSessionToken(token);

    req.shopifySession = payload; // contains shop, iss, dest, exp, etc.
    next();
  } catch (err) {
    console.error("❌ Invalid Shopify session token:", err.message);
    return res.status(401).send("Unauthorized Shopify request");
  }
}

module.exports = shopifySessionMiddleware;
