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

    // --- 1️⃣ Shopify App Bridge token (JWT)
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      try {
        // Decode Shopify JWT
        const payload = await shopify.session.decodeSessionToken(token);
        if (!payload) throw new Error("Invalid JWT payload");

        const shop = payload.dest?.replace(/^https:\/\//, "").toLowerCase();

        // Shopify’s JWT sub = user ID (for online sessions)
        // Construct potential session IDs
        const onlineSessionId = `${shop}_${payload.sub}`;
        const offlineSessionId = `offline_${shop}`;

        // Try both online and offline
        let session =
          (await customSessionStorage.loadCallback(onlineSessionId)) ||
          (await customSessionStorage.loadCallback(offlineSessionId));

        if (!session) {
          console.warn("⚠️ No session found for decoded JWT, falling back to cookie");
          throw new Error("Session not found");
        }

        req.shopify = { shop, session };
        console.log("✅ Shopify session validated via JWT:", shop);
        return next();
      } catch (err) {
        console.warn("⚠️ Invalid or expired Shopify JWT, falling back to cookie check:", err.message);
      }
    }

    // --- 2️⃣ Cookie fallback (used for browser requests)
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

    // --- 3️⃣ If no token or cookie, allow non-Shopify users
    console.log("ℹ️ No Shopify token/cookie — treating as non-Shopify user");
    return next();
  } catch (err) {
    console.error("❌ Shopify session token validation failed:", err);
    return res.status(401).json({ error: "Invalid or expired Shopify session token" });
  }
};
