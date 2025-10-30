require("@shopify/shopify-api/adapters/node");
const { Auth } = require("@shopify/shopify-api");
const customSessionStorage = require("./sessionStorage");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("ℹ️ No Shopify session token — treating as external user");
      req.shopify = null;
      return next();
    }

    const token = authHeader.replace("Bearer ", "");
    let payload;

    try {
      payload = await Auth.validateAuthenticatedSessionToken(token);
    } catch (err) {
      console.warn("❌ Invalid Shopify session token:", err.message);
      return res.status(401).send("Session expired or invalid.");
    }

    const shop = payload.dest.replace(/^https:\/\//, "").toLowerCase();
    const onlineSessionId = `${shop}_${payload.sub}`;

    const session =
      (await customSessionStorage.loadCallback(onlineSessionId)) ||
      (await customSessionStorage.loadCallback(`offline_${shop}`));

    if (!session) {
      console.warn("⚠️ No session found for token");
      return res.status(401).send("Session expired or invalid.");
    }

    req.shopify = { shop, session, payload };
    console.log("✅ Shopify session validated via JWT:", shop);
    next();
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    res.status(500).send("Internal server error");
  }
};
