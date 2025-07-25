const fs = require("fs");
const path = require("path");
const { shopify } = require("./shopify");
const { Session } = require("@shopify/shopify-api");

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
  async storeSession(session) {
    const sessions = loadSessions();
    const normalizedShop = normalizeShop(session.shop);
    const sessionId = `offline_${normalizedShop}`;
    session.id = sessionId;
    const serialized = await shopify.session.serializeSession(session);
    sessions[sessionId] = serialized;
    saveSessions(sessions);
    return true;
  },

  async loadSession(id) {
    const sessions = loadSessions();
    const raw = sessions[id];
    if (!raw) return undefined;
    return await shopify.session.deserializeSession(raw);
  },

  async deleteSession(id) {
    const sessions = loadSessions();
    if (sessions[id]) {
      delete sessions[id];
      saveSessions(sessions);
    }
    return true;
  },

  async findSessionsByShop(shop) {
    const sessions = loadSessions();
    const normalized = normalizeShop(shop);
    const allSessions = await Promise.all(
      Object.values(sessions).map((raw) => shopify.session.deserializeSession(raw))
    );
    return allSessions.filter((s) => normalizeShop(s.shop) === normalized);
  },
};

module.exports = customSessionStorage;