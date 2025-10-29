const { shopify } = require("./shopify");
const customSessionStorage = require("./sessionStorage");

module.exports = async function verifySessionToken(req, res, next) {
  console.log("🟢 [verifySessionToken] Incoming request:", req.method, req.originalUrl);
  console.log("📦 [verifySessionToken] Headers:", req.headers);

  try {
    const authHeader = req.headers.authorization;
    console.log("🧾 [verifySessionToken] Auth header:", authHeader);

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      console.log("🔑 [verifySessionToken] Extracted token (first 60 chars):", token.slice(0, 60) + "...");

      if (!shopify?.session?.decodeSessionToken) {
        console.error("❌ [verifySessionToken] shopify.session.decodeSessionToken is undefined!");
        return res.status(500).send("Shopify API not initialized properly.");
      }

      try {
        console.log("🧩 [verifySessionToken] Decoding token...");
        const payload = await shopify.session.decodeSessionToken(token);
        console.log("✅ [verifySessionToken] Decoded payload:", payload);

        if (!payload) throw new Error("Invalid JWT payload");

        const shop = payload.dest?.replace(/^https:\/\//, "").toLowerCase();
        const onlineSessionId = `${shop}_${payload.sub}`;
        const offlineSessionId = `offline_${shop}`;

        console.log("📘 [verifySessionToken] Searching for session IDs:", {
          onlineSessionId,
          offlineSessionId,
        });

        const session =
          (await customSessionStorage.loadCallback(onlineSessionId)) ||
          (await customSessionStorage.loadCallback(offlineSessionId));

        if (session) {
          console.log("✅ [verifySessionToken] Found valid session for shop:", shop);
          req.shopify = { shop, session, payload };
          return next();
        }

        console.warn("⚠️ [verifySessionToken] No session found for payload — possibly expired");
        return res.status(401).send("Session expired or invalid.");
      } catch (err) {
        console.warn("⚠️ [verifySessionToken] Invalid or expired JWT:", err);
        return res.status(401).send("Invalid Shopify session token.");
      }
    }

    console.log("ℹ️ [verifySessionToken] No Shopify token found — proceeding as external user");
    req.shopify = null;
    return next();
  } catch (err) {
    console.error("❌ [verifySessionToken] General failure:", err);
    req.shopify = null;
    next();
  }
};
