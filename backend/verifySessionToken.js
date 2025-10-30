// verifySessionToken.js
const { shopify } = require("./shopify");
const customSessionStorage = require("./sessionStorage");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const payload = await shopify.session.decodeSessionToken(token);
        const shop = payload.dest.replace(/^https:\/\//, "");
        const onlineSessionId = `${shop}_${payload.sub}`;
        const session = await customSessionStorage.loadCallback(onlineSessionId);
    
        if (!session) return res.status(401).send("Session expired or invalid");
        req.shopify = { shop, session, payload };
        return next();
      } catch (err) {
        return res.status(401).send("Invalid session token");
      }
    }
    
    console.log("ℹ️ No Shopify session token — treating as external user");
    req.shopify = null;
    return next();
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    req.shopify = null;
    next();
  }
};
