// --- sessionStorage.js ---
const fs = require("fs");
const path = require("path");
const SESSION_FILE = path.resolve(__dirname, "sessions.json");

function normalizeShop(shop) {
  return shop.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function load() {
  if (!fs.existsSync(SESSION_FILE)) {
    fs.writeFileSync(SESSION_FILE, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(SESSION_FILE));
}

function save(sessions) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
}

module.exports = {
  storeSession: async (session) => {
    const all = load();
    const key = normalizeShop(session.shop);
    all[key] = session;
    console.log("💾 Saving session under key:", key);
    save(all);
    console.log("✅ Session saved for shop:", key);
  },

  findSessionsByShop: async (shop) => {
    const all = load();
    const key = normalizeShop(shop);
    console.log("🔍 Looking for session with key:", key);
    return all[key] ? [all[key]] : [];
  },  

  loadSessions: () => load(),
};