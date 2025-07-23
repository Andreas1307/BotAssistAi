const jwt = require("jsonwebtoken");
const { shopify, sessionStorage } = require("./shopify");

function verifyJWT(token) {
  // Get your app's secret key from environment variables or Shopify config
  const secret = process.env.SHOPIFY_API_SECRET || "<YOUR_SHOPIFY_API_SECRET>";

  try {
    // Verify token and get payload
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    return payload;
  } catch (err) {
    throw new Error("Invalid JWT token");
  }
}

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.replace(/^Bearer\s/, "");
    const payload = verifyJWT(token);

    if (!payload || !payload.dest || !payload.sub) {
      throw new Error("Invalid token payload");
    }

    const shop = payload.dest.replace(/^https:\/\//, "");
    const sessionId = `${shop}_${payload.sub}`;
    const session = await sessionStorage.loadSession(sessionId);

    if (!session || !session.accessToken) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    res.locals.shopify = { session };
    return next();
  } catch (err) {
    console.error("Error verifying session token:", err.message);
    return res.status(401).json({ error: "Session token invalid" });
  }
};
