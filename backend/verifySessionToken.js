const { loadCurrentSession } = require("@shopify/shopify-api");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const session = await loadCurrentSession(req, res, true); // true = isOnline session

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
