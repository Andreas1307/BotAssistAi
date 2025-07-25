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
  storeSession: async (session) => {
    const sessions = loadSessions();
    const normalized = normalizeShop(session.shop);
    sessions[normalized] = session;
    console.log("💾 Saving session under:", normalized);
    saveSessions(sessions);
    return true;
  },

  findSessionsByShop: async (shop) => {
    const sessions = loadSessions();
    const normalized = normalizeShop(shop);
    return sessions[normalized] ? [sessions[normalized]] : [];
  },
};

module.exports = customSessionStorage;
