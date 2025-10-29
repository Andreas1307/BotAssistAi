// verifySessionToken.js
const { shopify } = require("./shopify");
const customSessionStorage = require("./sessionStorage");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("ℹ️ No Shopify session token — treating as external user");
      req.shopify = null;
      return next();
    }

    try {
      // ✅ Shopify officially supports this pattern
      const sessionId = await shopify.session.getCurrentId({
        isOnline: true,
        rawRequest: req,
        rawResponse: res,
      });

      if (!sessionId) {
        console.warn("⚠️ No session ID found for token");
        return res.status(401).send("Session invalid or expired.");
      }

      const session =
        (await customSessionStorage.loadCallback(sessionId)) ||
        (await customSessionStorage.loadCallback(`offline_${sessionId.split("_")[0]}`));

      if (!session) {
        console.warn("⚠️ No session found in storage");
        return res.status(401).send("Session expired or invalid.");
      }

      req.shopify = { shop: session.shop, session };
      console.log("✅ Shopify session validated via getCurrentId:", session.shop);
      return next();
    } catch (err) {
      console.warn("⚠️ Token verification failed:", err.message);
      return res.status(401).send("Invalid or expired Shopify session token.");
    }
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    req.shopify = null;
    next();
  }
};
