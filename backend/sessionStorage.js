const fs = require("fs");
const path = require("path");
const { shopify } = require("./shopify");

const SESSION_FILE = path.resolve(__dirname, "sessions.json");

const normalizeShop = (shop) => {
  if (typeof shop !== "string") return "";
  return shop.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
};


function loadSessions() {
  if (!fs.existsSync(SESSION_FILE)) {
    console.log("🆕 No sessions file found. Creating new one...");
    fs.writeFileSync(SESSION_FILE, JSON.stringify({}));
  }

  const data = fs.readFileSync(SESSION_FILE, "utf-8");
  try {
    const parsed = JSON.parse(data);
    console.log("📂 Loaded sessions:", Object.keys(parsed));
    return parsed;
  } catch (err) {
    console.error("❌ Failed to parse sessions file:", err);
    return {};
  }
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
  console.log("💾 Saved sessions:", Object.keys(sessions));
}

const customSessionStorage = {
  async storeSession(session) {
    try {
      const sessions = loadSessions();
  
      const shop = normalizeShop(session.shop);
  
      let sub;
      // Try to decode token to get `sub`
      try {
        const token = session.accessToken; // Shopify session token
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          sub = payload.sub;
        }
      } catch (err) {
        console.warn("⚠️ Could not decode token to extract sub");
      }
  
      if (!sub) {
        console.error("❌ Failed to extract sub from token");
        return false;
      }
  
      const sessionId = `${shop}_${sub}`;
      console.log("📝 Storing session for:", shop);
      console.log("🔐 Session ID will be:", sessionId);
  
      const serialized = await shopify.session.serializeSession(session);
      if (!serialized) {
        console.error("❌ Failed to serialize session.");
        return false;
      }
  
      sessions[sessionId] = serialized;
      saveSessions(sessions);
      return true;
    } catch (err) {
      console.error("❌ Error in storeSession:", err);
      return false;
    }
  }
  , 

  async loadSession(id) {
    console.log("🔍 Loading session with ID:", id);
    const sessions = loadSessions();
    const raw = sessions[id];
    if (!raw) {
      console.warn("⚠️ No session found for ID:", id);
      return undefined;
    }

    try {
      const deserialized = await shopify.session.deserializeSession(raw);
      console.log("✅ Session successfully deserialized");
      return deserialized;
    } catch (err) {
      console.error("❌ Failed to deserialize session:", err);
      return undefined;
    }
  },

  async deleteSession(id) {
    const sessions = loadSessions();
    if (sessions[id]) {
      console.log("🗑️ Deleting session:", id);
      delete sessions[id];
      saveSessions(sessions);
    }
    return true;
  },

  async findSessionsByShop(shop) {
    const sessions = loadSessions();
    const normalized = normalizeShop(shop);
    const allSessions = await Promise.all(
      Object.values(sessions).map((raw) => shopify.session.deserializeSession(raw))
    );
    return allSessions.filter((s) => normalizeShop(s.shop) === normalized);
  },
};

module.exports = customSessionStorage;
