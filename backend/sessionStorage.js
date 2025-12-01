// sessionStorage.js

const { Session } = require("@shopify/shopify-api");
const fs = require("fs");
const path = require("path");

const SESSIONS_FILE = path.join(__dirname, "sessions.json");

function ensureFile() {
  if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}), "utf8");
}

function loadSessions() {
  ensureFile();
  try {
    const data = fs.readFileSync(SESSIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf8");
}

module.exports = {
  storeCallback: async (session) => {
    if (!session.id || !session.shop) return false;

    const sessions = loadSessions();

    // Use Shopify-style session ID format
    let sessionId = session.isOnline
      ? `${session.id}` // online session
      : `offline_${session.shop}`; // offline session

    sessions[sessionId] = {
      id: sessionId,
      shop: session.shop,
      isOnline: session.isOnline,
      accessToken: session.accessToken,
      scope: session.scope,
      expires: session.expires?.toISOString(),
      state: session.state || null,
      onlineAccessInfo: session.onlineAccessInfo || null,
    };

    saveSessions(sessions);
    console.log("✅ Stored session:", sessionId);
    return true;
  },

  loadCallback: async (id) => {
    const sessions = loadSessions();
    const data = sessions[id];
    if (!data) {
      console.error("Session not found for id:", id);
      return undefined;
    }

    return new Session({
      id: data.id,
      shop: data.shop,
      isOnline: data.isOnline,
      state: data.state,
      scope: data.scope,
      expires: data.expires ? new Date(data.expires) : null,
      accessToken: data.accessToken,
      onlineAccessInfo: data.onlineAccessInfo,
    });
  },

  deleteCallback: async (id) => {
    const sessions = loadSessions();
    if (sessions[id]) {
      delete sessions[id];
      saveSessions(sessions);
      console.log("🗑️ Deleted session:", id);
    }
    return true;
  },

  getAllSessions: async () => {
    const sessions = loadSessions();
    return Object.values(sessions);
  },
};
