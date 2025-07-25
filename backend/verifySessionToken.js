// verifySessionToken.js
const { shopify, customSessionStorage } = require("./shopify");

// ✅ Helper: Normalize shop domain
function normalizeShop(shop) {
  return shop.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

// ✅ Helper: Delay function
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ Helper: Retry finding session (resolves race condition after login)
async function retryFindSession(shop, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    const sessions = await customSessionStorage.findSessionsByShop(shop);
    if (sessions.length > 0) return sessions;
    console.log(`⏳ Session not found for ${shop}, retrying (${i + 1}/${attempts})...`);
    await wait(300);
  }
  return [];
}

// ✅ Middleware: Verifies session token
module.exports = async function verifySessionToken(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const shopHeader = req.headers["x-shopify-shop-domain"];

    if (!token || !shopHeader) {
      console.warn("❌ Missing token or shop header");
      return res.status(401).json({ error: "Missing token or shop domain" });
    }

    const shopHeaderNormalized = normalizeShop(shopHeader);
    console.log("🔑 Decoding token...");
    const payload = await shopify.session.decodeSessionToken(token);

    const tokenShop = normalizeShop(payload.dest);
    console.log("🔍 Token shop:", tokenShop);
    console.log("📫 Header shop:", shopHeaderNormalized);

    if (tokenShop !== shopHeaderNormalized) {
      console.warn("⚠️ Token shop mismatch");
      return res.status(401).json({ error: "Token and shop mismatch" });
    }

    const sessions = await retryFindSession(tokenShop);
    console.log("📦 Found sessions:", sessions.length);

    if (!sessions || sessions.length === 0) {
      console.warn("⚠️ No session found for shop:", tokenShop);
      return res.status(401).json({ error: "Session not found or expired" });
    }

    req.shopify = { shop: tokenShop, session: sessions[0] };
    next();
  } catch (err) {
    console.error("❌ verifySessionToken error:", err);
    return res.status(401).json({ error: "Token verification failed" });
  }
};
