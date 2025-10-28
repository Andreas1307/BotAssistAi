const { shopify } = require("./shopify");
const customSessionStorage = require("./sessionStorage");

/**
 * Verifies both Shopify (JWT or cookie) and non-Shopify users.
 *  - JWT: Shopify App Bridge session token (audit requirement)
 *  - Cookie: shopify_online_session fallback
 *  - None: non-Shopify user
 */
module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Shopify JWT session token
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      try {
        // ✅ FIX: use new API method
        const payload = await shopify.auth.decodeSessionToken(token);
        if (!payload) throw new Error("Invalid JWT payload");

        const shop = payload.dest?.replace(/^https:\/\//, "").toLowerCase();
        const onlineSessionId = `${shop}_${payload.sub}`;
        const offlineSessionId = `offline_${shop}`;

        const session =
          (await customSessionStorage.loadCallback(onlineSessionId)) ||
          (await customSessionStorage.loadCallback(offlineSessionId));

        if (session) {
          req.shopify = { shop, session };
          console.log("✅ Shopify session validated via JWT:", shop);
          return next();
        }
      } catch (err) {
        console.warn("⚠️ JWT invalid or expired, falling back to cookie:", err.message);
      }
    }

    // 2️⃣ Cookie fallback
    if (req.cookies?.shopify_online_session) {
      const accessToken = req.cookies.shopify_online_session;
      const allSessions = await customSessionStorage.getAllSessions();
      const session = allSessions.find(s => s.accessToken === accessToken);

      if (session) {
        req.shopify = { shop: session.shop, session };
        console.log("✅ Shopify session validated via cookie:", session.shop);
        return next();
      }
    }

    // 3️⃣ No Shopify auth
    console.log("ℹ️ No Shopify session token or cookie — treating as non-Shopify user");
    req.shopify = null;
    next();

  } catch (err) {
    console.error("❌ Session verification failed:", err);
    req.shopify = null;
    next();
  }
};
