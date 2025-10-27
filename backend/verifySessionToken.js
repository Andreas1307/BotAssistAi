const { shopify } = require("./shopify");
const customSessionStorage = require("./sessionStorage");

/**
 * Middleware to verify Shopify (embedded) or non-Shopify users.
 * 1️⃣ Checks for a valid Bearer JWT (App Bridge session token)
 * 2️⃣ Falls back to cookie-based session for browsers
 */
module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Shopify JWT token
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const payload = await shopify.session.decodeSessionToken(token);
        if (!payload) throw new Error("Invalid JWT payload");

        const shop = payload.dest?.replace(/^https:\/\//, "").toLowerCase();
        const onlineSessionId = `${shop}_${payload.sub}`;
        const offlineSessionId = `offline_${shop}`;

        const session =
          (await customSessionStorage.loadCallback(onlineSessionId)) ||
          (await customSessionStorage.loadCallback(offlineSessionId));

        if (!session) throw new Error("Session not found");

        req.shopify = { shop, session };
        console.log("✅ Shopify session validated via JWT:", shop);
        return next();
      } catch (err) {
        console.warn("⚠️ Invalid or expired Shopify JWT:", err.message);
      }
    }

    // 2️⃣ Cookie fallback for browser (non-Shopify users)
    if (req.cookies?.shopify_online_session) {
      const accessToken = req.cookies.shopify_online_session;
      const allSessions = await customSessionStorage.getAllSessions();
      const session = allSessions.find(s => s.accessToken === accessToken);

      if (session) {
        req.shopify = { shop: session.shop, session };
        console.log("✅ Shopify session validated via cookie:", session.shop);
        return next();
      }
      console.warn("⚠️ Cookie found but no matching session in storage");
    }

    // 3️⃣ No token or cookie → non-Shopify user
    req.shopify = null;
    return next();
  } catch (err) {
    console.error("❌ Shopify session token validation failed:", err);
    return res.status(401).json({ error: "Invalid or expired Shopify session token" });
  }
};
