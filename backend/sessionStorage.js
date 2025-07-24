const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.resolve(__dirname, 'sessions.json');

function normalizeShop(shop) {
  return shop.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function loadSessions() {
  try {
    return JSON.parse(fs.readFileSync(SESSIONS_FILE));
  } catch {
    return {};
  }
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

module.exports = {
  storeSession: async (session) => {
    const sessions = loadSessions();
    const normalizedShop = normalizeShop(session.shop);
    const sessionId = session.id;

    session.shop = normalizedShop; // 🚨 Normalize before saving
    sessions[sessionId] = session;

    saveSessions(sessions);
    console.log("💾 Stored session for:", normalizedShop);
    return true;
  },

  findSessionsByShop: async (shop) => {
    const sessions = loadSessions();
    const normalized = normalizeShop(shop);
    const matched = Object.values(sessions).filter(s => normalizeShop(s.shop) === normalized);
    console.log("🔍 Looking for:", normalized);
    console.log("🧠 Found matching sessions:", matched.length);
    return matched;
  },

  loadSession: async (id) => {
    const sessions = loadSessions();
    return sessions[id] || null;
  },

  deleteSession: async (id) => {
    const sessions = loadSessions();
    delete sessions[id];
    saveSessions(sessions);
    return true;
  },
};
