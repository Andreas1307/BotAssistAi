const fs = require("fs"), path = require("path");
const SESSIONS_FILE = path.resolve(__dirname, "sessions.json");

const normalize = shop => shop.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

function load() {
  if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(SESSIONS_FILE));
}

function save(all) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(all, null, 2));
}

module.exports = {
  storeSession: async (session) => {
    if (!session?.shop || !session?.accessToken) {
      console.warn("⚠️ session missing fields");
      return false;
    }

    const all = load();
    all[normalize(session.shop)] = session;
    save(all);
    console.log("💾 Stored session for:", normalize(session.shop));
    return true;
  },

  findSessionsByShop: async (shop) => {
    const all = load();
    const normalized = normalize(shop);
    const found = all[normalized] ? [all[normalized]] : [];
    console.log("🔍 Looking for:", normalized, "| found:", found.length);
    return found;
  }
};
