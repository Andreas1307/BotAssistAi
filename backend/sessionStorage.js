const fs = require("fs");
const path = require("path");
const { shopify } = require("./shopify"); 
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
    const serialized = await shopify.session.serializeSession(session); // ✅ serialize
    sessions[session.id] = serialized;
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

    const session = await shopify.session.deserializeSession(raw); // ✅ deserialize
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
      .map((raw) => shopify.session.deserializeSession(raw)) // deserialize all
      .filter(async (sPromise) => {
        const s = await sPromise;
        return normalizeShop(s.shop) === normalized;
      });

    return Promise.all(found);
  },
};

module.exports = customSessionStorage;
