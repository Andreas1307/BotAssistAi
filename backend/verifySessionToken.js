require("@shopify/shopify-api/adapters/node");

const { decodeSessionToken } = require("@shopify/shopify-api/lib/auth/session/decode-session-token");
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
    let payload = null;

    try {
      payload = decodeSessionToken(token); // ✅ now properly imported
    } catch (err) {
      console.warn("❌ Failed to decode JWT:", err.message);
    }

    if (payload) {
      const shop = payload.dest.replace(/^https:\/\//, "").toLowerCase();
      const onlineSessionId = `${shop}_${payload.sub}`;

      const session =
        (await customSessionStorage.loadCallback(onlineSessionId)) ||
        (await customSessionStorage.loadCallback(`offline_${shop}`));

      if (session) {
        req.shopify = { shop, session, payload };
        console.log("✅ Shopify session validated via JWT:", shop);
        return next();
      }
    }

    const session = await customSessionStorage.loadCallbackByAccessToken?.(token);
    if (session) {
      req.shopify = { shop: session.shop, session, payload: null };
      console.log("✅ Shopify session validated via offline token:", session.shop);
      return next();
    }

    console.warn("⚠️ No session found for token");
    return res.status(401).send("Session expired or invalid.");
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    req.shopify = null;
    next();
  }
};
