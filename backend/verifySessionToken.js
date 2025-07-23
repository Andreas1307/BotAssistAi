const { shopify } = require("./shopify");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const session = await shopify.utils.loadCurrentSession(req, res, true); // true = isOnline

    if (!session || !session.accessToken) {
      console.error("❌ No valid Shopify session found.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.locals.shopify = { session };
    return next();
  } catch (err) {
    console.error("❌ Session verification failed:", err.message);
    return res.status(401).json({ error: "Invalid session" });
  }
};
