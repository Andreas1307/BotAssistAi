const fs = require("fs");
const path = require("path");
const { shopify } = require("./shopify"); 
const { Session } = require("@shopify/shopify-api");
console.log("Inside session storage")
const SESSION_FILE = path.resolve(__dirname, "sessions.json");

const normalizeShop = (shop) =>
  shop.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

function loadSessions() {
  if (!fs.existsSync(SESSION_FILE)) fs.writeFileSync(SESSION_FILE, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(SESSION_FILE));
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
}

const customSessionStorage = {
  async storeSession(session) {
    console.log("storeSession called with session:", session);
    const sessions = loadSessions();
    const normalizedShop = normalizeShop(session.shop);
  
    session.id = `offline_${normalizedShop}`;
    const forcedId = session.id;
  
    const serialized = await shopify.session.serializeSession(session);
    sessions[forcedId] = serialized;
  
    console.log("💾 Saving session:", forcedId, "for shop:", normalizedShop);
    saveSessions(sessions);
    console.log("Session saved to sessions.json");
    return true;
  }
  
  ,

  async loadSession(id) {
    const sessions = loadSessions();
    console.log("loadsession sessions", sessions)
    const raw = sessions[id];
    if (!raw) {
      console.warn("❌ No session found for id:", id);
      return undefined;
    }

    const session = await shopify.session.deserializeSession(raw); // ✅ deserialize
    console.log("loadsession session", session)
    console.log("📤 Loaded session:", id);
    return session;
  },

  async deleteSession(id) {
    const sessions = loadSessions();
    if (sessions[id]) {
      delete sessions[id];
      saveSessions(sessions);
      console.log("🗑️ Deleted session:", id);
    }
    return true;
  },

  async findSessionsByShop(shop) {
    const sessions = loadSessions();
    const normalized = normalizeShop(shop);
  
    // 1. Deserialize all sessions (waits for all promises)
    const allSessions = await Promise.all(
      Object.values(sessions).map((raw) =>
        shopify.session.deserializeSession(raw)
      )
    );
  
    // 2. Filter by shop match
    const matched = allSessions.filter(
      (s) => normalizeShop(s.shop) === normalized
    );
  
    return matched;
  },  
};

module.exports = customSessionStorage;
