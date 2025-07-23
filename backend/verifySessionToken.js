const { shopify, sessionStorage } = require("./shopify");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid authorization header.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Decode App Bridge JWT
    const payload = await shopify.session.decodeSessionToken(token);
    const shop = payload.dest?.replace(/^https:\/\//, "");

    if (!shop) {
      console.error("❌ No shop found in token payload");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Load session from storage (this is the real Admin API session)
    const session = await sessionStorage.loadSession(payload.sid, true); // true = isOnline

    if (!session || !session.accessToken) {
      console.error("❌ No valid stored session for shop:", shop);
      return res.status(401).json({ error: "Session expired or missing" });
    }

    // Attach full session to req
    req.shopify = { shop, session };

    next();
  } catch (err) {
    console.error("❌ Token validation failed:", err.message);
    return res.status(401).json({ error: "Invalid session" });
  }
};
