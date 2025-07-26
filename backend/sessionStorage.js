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
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Failed to parse sessions file:", err);
    return {};
  }
}


function saveSessions(sessions) {
  console.log("💾 Saving sessions to:", SESSION_FILE);
  console.log("📌 Sessions to save:", Object.keys(sessions));
  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
  console.log("💾 Saved sessions:", Object.keys(sessions));
}

const customSessionStorage = {
  async storeSession(session) {
    const sessionId = session.isOnline ? session.id.replace(`${session.shop}_`, "") : session.id;
    console.log("📝 Storing session with ID:", sessionId);
  
    const serialized = await shopify.session.serializeSession(session); // ✅ FIXED HERE
    if (!serialized) throw new Error("❌ Serialization failed");
  
    const sessions = loadSessions();
    sessions[sessionId] = serialized;
  
    saveSessions(sessions); // Writes to file
    console.log("✅ Session stored to file");
  
    return true;
  },   

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
