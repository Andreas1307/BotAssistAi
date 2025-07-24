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

module.exports = {
  storeSession: async (session) => {
    const sessions = loadSessions(); // ✅ reload every time
    const sessionId = session.id || `${session.shop}_${session.scope || 'default'}`;
    sessions[sessionId] = session;
    saveSessions(sessions);
    return true;
  },

  findSessionsByShop: async (shop) => {
    const sessions = loadSessions(); // ✅ reload every time
    const normalized = shop.toLowerCase();
    return Object.values(sessions).filter(s => s.shop?.toLowerCase() === normalized);
  },

  loadSession: async (id) => {
    const sessions = loadSessions(); // ✅ reload every time
    return sessions[id] || null;
  },

  deleteSession: async (id) => {
    const sessions = loadSessions(); // ✅ reload every time
    delete sessions[id];
    saveSessions(sessions);
    return true;
  }
};
