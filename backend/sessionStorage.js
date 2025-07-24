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
 console.log('📄 Using sessions file at:', SESSIONS_FILE);
module.exports = {
   
    storeSession: async (session) => {
        const sessionId = session.id || `${session.shop}_${session.scope || 'default'}`;
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
    const result = Object.values(sessions).filter((s) => {
      return s.shop?.toLowerCase() === normalizedShop;
    });
    console.log(`🔍 Looking for shop "${normalizedShop}". Found:`, result.length);
    return result;
  }
};
