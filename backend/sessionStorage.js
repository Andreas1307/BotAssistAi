const fs = require("fs");
const path = require("path");
const { shopify } = require("./shopify"); // import to access Session class
const { Session } = require("@shopify/shopify-api");

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
    const sessions = loadSessions();
    sessions[session.id] = session; // Raw session is OK to store
    saveSessions(sessions);
    console.log("💾 Saved session:", session.id);
    return true;
  },

  async loadSession(id) {
    const sessions = loadSessions();
    const raw = sessions[id];
    if (!raw) {
      console.warn("❌ No session found for id:", id);
      return undefined;
    }

    // 👇 Deserialize properly
    const session = new Session(raw.id);
    Object.assign(session, raw);
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
    const found = Object.values(sessions)
      .filter((s) => normalizeShop(s.shop) === normalized)
      .map((raw) => {
        const session = new Session(raw.id);
        Object.assign(session, raw);
        return session;
      });
    return found;
  },
};

module.exports = customSessionStorage;
