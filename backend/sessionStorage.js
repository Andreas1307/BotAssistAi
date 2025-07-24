// backend/sessionStorage.js
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
        const sessionId = session.id || session.shop; // fallback
        if (!sessionId) {
          console.error('❌ Cannot store session: no ID or shop', session);
          return false;
        }
      
        sessions[sessionId] = session;
        console.log('💾 Saving session with ID:', sessionId);
        saveSessions(sessions);
        return true;
      },

  loadSession: async (id) => {
    return sessions[id] || null;
  },

  deleteSession: async (id) => {
    delete sessions[id];
    saveSessions(sessions);
    return true;
  },

  findSessionsByShop: async (shop) => {
    const normalizedShop = shop.replace(/^https:\/\//, '').toLowerCase();
    return Object.values(sessions).filter((s) => {
      return s.shop?.toLowerCase() === normalizedShop;
    });
  }
  
};
