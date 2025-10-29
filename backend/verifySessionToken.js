const { shopify } = require("./shopify");

module.exports = async function verifySessionToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const payload = await shopify.auth.decodeSessionToken(token); // ✅ now defined
      if (!payload) throw new Error("Invalid JWT payload");

      const shop = payload.dest.replace(/^https:\/\//, "").toLowerCase();
      const onlineSessionId = `${shop}_${payload.sub}`;
      const offlineSessionId = `offline_${shop}`;

      const session =
        (await customSessionStorage.loadCallback(onlineSessionId)) ||
        (await customSessionStorage.loadCallback(offlineSessionId));

      if (session) {
        req.shopify = { shop, session, payload };
        return next();
      }
      return res.status(401).send("Session expired or invalid.");
    } catch (err) {
      return res.status(401).send("Invalid Shopify session token.");
    }
  }

  req.shopify = null;
  next();
};