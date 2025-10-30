require("@shopify/shopify-api/adapters/node");
const { Auth } = require("@shopify/shopify-api");
const customSessionStorage = require("./sessionStorage");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      req.shopify = null;
      return next();
    }

    const token = authHeader.replace("Bearer ", "");
    let payload = null;

    try {
      payload = await Auth.validateAuthenticatedSessionToken(token);
    } catch (err) {
      console.warn("❌ Failed to validate Shopify JWT:", err.message);
    }

    if (payload) {
      const shop = payload.dest.replace(/^https:\/\//, "").toLowerCase();
      const onlineSessionId = `${shop}_${payload.sub}`;
      const session =
        (await customSessionStorage.loadCallback(onlineSessionId)) ||
        (await customSessionStorage.loadCallback(`offline_${shop}`));
      if (session) {
        req.shopify = { shop, session, payload };
        return next();
      }
    }

    const session = await customSessionStorage.loadCallbackByAccessToken?.(token);
    if (session) {
      req.shopify = { shop: session.shop, session, payload: null };
      return next();
    }

    return res.status(401).send("Session expired or invalid.");
  } catch (err) {
    console.error(err);
    req.shopify = null;
    next();
  }
};
