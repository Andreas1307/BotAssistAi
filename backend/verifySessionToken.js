// 📄 middleware/verifySessionToken.js
const jwt = require('jsonwebtoken');
const { SHOPIFY_API_SECRET } = process.env;

function verifySessionToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, SHOPIFY_API_SECRET, {
      algorithms: ["HS256"]
    });

    // Store shop domain in request
    req.shop = payload.dest.replace(/^https:\/\//, "");
    next();
  } catch (err) {
    console.error("❌ Invalid session token:", err.message);
    res.status(401).json({ error: "Invalid session token" });
  }
}

module.exports = verifySessionToken;
