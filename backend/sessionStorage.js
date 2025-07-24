const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.resolve(__dirname, 'sessions.json');

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
    const normalizedShop = session.shop.toLowerCase().replace(/^https:\/\//, '').replace(/\/$/, '');
    const sessionId = session.id;
    sessions[sessionId] = session;
    saveSessions(sessions);
    return true;
  },

  findSessionsByShop: async (shop) => {
    const sessions = loadSessions();
    const normalized = shop.toLowerCase().replace(/^https:\/\//, '').replace(/\/$/, '');
    return Object.values(sessions).filter(s => {
      const storedShop = s.shop?.toLowerCase().replace(/^https:\/\//, '');
      return storedShop === normalized;
    });
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
