const { shopify } = require("./shopify");
const customSessionStorage = require("./sessionStorage");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    // 1️⃣ Check Authorization header first (JWT)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const payload = await shopify.session.decodeSessionToken(token);
        if (!payload) throw new Error("Invalid JWT payload");

        const shop = payload.dest.replace(/^https:\/\//, "").toLowerCase();
        const onlineSessionId = `${shop}_${payload.sub}`;
        const offlineSessionId = `offline_${shop}`;

        const session =
          (await customSessionStorage.loadCallback(onlineSessionId)) ||
          (await customSessionStorage.loadCallback(offlineSessionId));

        if (session) {
          req.shopify = { shop, session, payload };
          console.log("✅ Shopify session validated via JWT:", shop);
          return next();
        }

        console.warn("⚠️ No session found for JWT payload");
        return res.status(401).send("Session expired or invalid.");
      } catch (err) {
        console.warn("⚠️ Invalid JWT:", err.message);
        return res.status(401).send("Invalid Shopify session token.");
      }
    }

    // 2️⃣ Fallback: check shopify_online_session cookie
    const cookieToken = req.cookies?.shopify_online_session;
    if (cookieToken) {
      try {
        // Decode cookie token the same way
        const payload = await shopify.session.decodeSessionToken(cookieToken);
        if (!payload) throw new Error("Invalid JWT payload");

        const shop = payload.dest.replace(/^https:\/\//, "").toLowerCase();
        const onlineSessionId = `${shop}_${payload.sub}`;
        const offlineSessionId = `offline_${shop}`;

        const session =
          (await customSessionStorage.loadCallback(onlineSessionId)) ||
          (await customSessionStorage.loadCallback(offlineSessionId));

        if (session) {
          req.shopify = { shop, session, payload };
          console.log("✅ Shopify session validated via cookie:", shop);
          return next();
        }

        console.warn("⚠️ No session found for cookie payload");
        return res.status(401).send("Session expired or invalid.");
      } catch (err) {
        console.warn("⚠️ Invalid Shopify cookie token:", err.message);
        return res.status(401).send("Invalid Shopify session token.");
      }
    }

    // 3️⃣ Treat as external user
    console.log("ℹ️ No Shopify session token — treating as external user");
    req.shopify = null;
    next();
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    req.shopify = null;
    next();
  }
};
