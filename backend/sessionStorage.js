const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.resolve(__dirname, 'sessions.json');

function loadSessions() {
  try {
    const raw = fs.readFileSync(SESSIONS_FILE);
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

const sessions = loadSessions();

module.exports = {
  storeSession: async (session) => {
    const sessionId = session.id || `${session.shop}_${session.scope || 'default'}`;
    sessions[sessionId] = session;
    saveSessions(sessions);
    return true;
  },

  findSessionsByShop: async (shop) => {
    const normalized = shop.toLowerCase();
    return Object.values(sessions).filter(s => s.shop?.toLowerCase() === normalized);
  },

  loadSession: async (id) => sessions[id] || null,

  deleteSession: async (id) => {
    delete sessions[id];
    saveSessions(sessions);
    return true;
  }
};
