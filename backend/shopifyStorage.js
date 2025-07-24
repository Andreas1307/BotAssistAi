const fs = require("fs");
const path = require("path");

const SESSIONS_FILE = path.resolve(__dirname, "sessions.json");

function normalizeShop(shop) {
  return shop.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function loadSessions() {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}));
      return {};
    }
    const data = fs.readFileSync(SESSIONS_FILE);
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Error loading sessions file:", err);
    return {};
  }
}

function saveSessions(sessions) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (err) {
    console.error("❌ Error saving sessions file:", err);
  }
}

module.exports = {
  storeSession: async (session) => {
    if (!session || !session.shop || !session.accessToken) return false;

    const sessions = loadSessions();
    const normalized = normalizeShop(session.shop);

    sessions[normalized] = session;
    saveSessions(sessions);
    console.log("💾 Stored session for:", normalized);
    return true;
  },

  findSessionsByShop: async (shop) => {
    const sessions = loadSessions();
    const normalized = normalizeShop(shop);
    const matched = sessions[normalized] ? [sessions[normalized]] : [];

    console.log("🛠 Normalized (lookup):", normalized);
    console.log("📂 Current keys:", Object.keys(sessions));
    return matched;
  },

  loadSession: async (idOrShop) => {
    const sessions = loadSessions();
    return sessions[idOrShop] || null;
  },

  deleteSession: async (idOrShop) => {
    const sessions = loadSessions();
    delete sessions[idOrShop];
    saveSessions(sessions);
    return true;
  },

  loadSessions,
};
