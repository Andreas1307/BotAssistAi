// verifySessionToken.js
const { shopify } = require("./shopify");
const customSessionStorage = require("./sessionStorage");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).send("Missing Shopify session token.");
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const payload = await shopify.session.decodeSessionToken(token);
      if (!payload) throw new Error("Invalid session token");

      const shop = payload.dest.replace(/^https:\/\//, "");
      req.shopify = { shop, payload };
      console.log("✅ Shopify session verified:", shop);
      return next();
    } catch (err) {
      console.warn("⚠️ Invalid or expired session token:", err.message);
      return res.status(401).send("Invalid Shopify session token.");
    }
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    res.status(500).send("Internal server error.");
  }
};