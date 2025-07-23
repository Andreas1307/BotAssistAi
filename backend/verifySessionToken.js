const { shopify, sessionStorage } = require("./shopify");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid authorization header.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await shopify.session.decodeSessionToken(token);

    // Extract the shop from the token payload, remove protocol if any
    const shop = payload.dest?.replace(/^https:\/\//, "");
    if (!shop) {
      console.error("❌ No shop found in token payload");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Use the same session ID format here
    const sessionId = `online_${shop}`;
    console.log("🔍 Looking for session with ID:", sessionId);

    // Try loading the session from your session storage
    const session = await sessionStorage.loadSession(sessionId);

    if (!session || !session.accessToken) {
      console.error("❌ No valid stored session for shop:", shop);
      return res.status(401).json({ error: "Session expired or missing" });
    }

    // Attach session info to request for downstream routes
    req.shopify = { shop, session };
    next();
  } catch (err) {
    console.error("❌ Token validation failed:", err.message);
    return res.status(401).json({ error: "Invalid session" });
  }
};

