const fs = require("fs");
const path = require("path");
const { Session } = require("@shopify/shopify-api");

const SESSIONS_FILE = path.join(__dirname, "sessions.json");

function loadSessions() {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}), "utf8");
    }
    const data = fs.readFileSync(SESSIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Failed to load sessions file:", error);
    return {};
  }
}

function saveSessions(sessions) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf8");
  } catch (error) {
    console.error("❌ Failed to save sessions file:", error);
  }
}

const storeCallback = async (session) => {
  console.log("🔥 Storing session:", session.id);

  const sessions = loadSessions();

  // Convert expires date to ISO string if present
  const sessionToStore = {
    id: session.id,
    shop: session.shop,
    state: session.state,
    isOnline: session.isOnline,
    scope: session.scope,
    accessToken: session.accessToken,
    expires: session.expires ? session.expires.toISOString() : null,
    onlineAccessInfo: session.onlineAccessInfo || null,
  };

  sessions[session.id] = sessionToStore;
  saveSessions(sessions);
  return true;
};

const loadCallback = async (id) => {
  const sessions = loadSessions();
  const sessionData = sessions[id];

  if (!sessionData) return undefined;

  // Rehydrate Session object with correct params
  const session = new Session(sessionData.id, sessionData.shop, sessionData.isOnline);
  session.state = sessionData.state;
  session.scope = sessionData.scope;
  session.accessToken = sessionData.accessToken;
  session.expires = sessionData.expires ? new Date(sessionData.expires) : undefined;
  session.onlineAccessInfo = sessionData.onlineAccessInfo || null;

  return session;
};

const deleteCallback = async (id) => {
  const sessions = loadSessions();
  if (sessions[id]) {
    delete sessions[id];
    saveSessions(sessions);
  }
  return true;
};

module.exports = {
  storeCallback,
  loadCallback,
  deleteCallback,
};
