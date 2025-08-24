const { shopify } = require("./shopify"); // your shopify.js config

async function shopifySessionMiddleware(req, res, next) {
  try {
    // Validate the App Bridge session token
    const session = await shopify.auth.authenticate({
      rawRequest: req,
      rawResponse: res,
    });

    req.shopifySession = session;
    next();
  } catch (err) {
    console.error("❌ Shopify session authentication failed:", err.message);
    return res.status(401).send("Unauthorized Shopify request");
  }
}

module.exports = shopifySessionMiddleware;
