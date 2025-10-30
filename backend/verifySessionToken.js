require("@shopify/shopify-api/adapters/node");
const { Session } = require("@shopify/shopify-api"); // ✅ direct import
const customSessionStorage = require("./sessionStorage");

module.exports = async function verifySessionToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      // ✅ Use the Session class (not shopify.session)
      const payload = await Session.decodeSessionToken(token, {
        apiSecretKey: process.env.SHOPIFY_API_SECRET,
      });

      if (!payload?.dest) throw new Error("Invalid Shopify session token");

      const shop = payload.dest.replace(/^https:\/\//, "").toLowerCase();
      const onlineId = `${shop}_${payload.sub}`;
      const offlineId = `offline_${shop}`;

      const session =
        (await customSessionStorage.loadCallback(onlineId)) ||
        (await customSessionStorage.loadCallback(offlineId));

      if (!session) {
        console.warn(`⚠️ No stored session for ${shop}`);
        return res.status(401).send("Shopify session not found.");
      }

      req.shopify = { shop, session, payload };
      console.log(`✅ Verified Shopify JWT for ${shop}`);
      return next();
    }

    console.log("ℹ️ No Shopify session token — treating as external user");
    req.shopify = null;
    next();
  } catch (err) {
    console.error("❌ verifySessionToken error:", err);
    return res.status(401).send("Invalid Shopify session token");
  }
};
