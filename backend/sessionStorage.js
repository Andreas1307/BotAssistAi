const fs = require("fs");
const path = require("path");
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
  // Required by Shopify API
  async storeSession(session) {
    const sessions = loadSessions();
    sessions[session.id] = session;
    saveSessions(sessions);
    console.log("💾 Saved session:", session.id);
    return true;
  },

  async loadSession(id) {
    const sessions = loadSessions();
    if (sessions[id]) {
      console.log("📤 Loaded session:", id);
      return sessions[id];
    }
    console.warn("❌ No session found for id:", id);
    return undefined;
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

  // Your custom lookup by shop
  async findSessionsByShop(shop) {
    const sessions = loadSessions();
    const normalized = normalizeShop(shop);
    const found = Object.values(sessions).filter(
      (s) => normalizeShop(s.shop) === normalized
    );
    return found;
  },
};

module.exports = customSessionStorage;
