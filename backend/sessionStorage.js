const fs = require("fs");
const path = require("path");
const { Session } = require("@shopify/shopify-api");

const SESSIONS_FILE = path.join(__dirname, "sessions.json");

function ensureSessionsFile() {
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}), "utf8");
  }
}

function loadSessions() {
  try {
    ensureSessionsFile();
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
    console.log("💾 Sessions file updated");
  } catch (error) {
    console.error("❌ Failed to save sessions file:", error);
  }
}

const storeCallback = async (session) => {
  try {
    console.log("🔥 Storing session:", session.id);

    const sessions = loadSessions();

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
    console.log("✅ Session stored:", session.id);
    return true;
  } catch (err) {
    console.error("❌ Failed to store session:", err);
    return false;
  }
};

const loadCallback = async (id) => {
  try {
    const sessions = loadSessions();
    const sessionData = sessions[id];

    if (!sessionData) {
      console.warn("⚠️ No session found with ID:", id);
      return undefined;
    }

    const session = new Session(sessionData.id, sessionData.shop, sessionData.isOnline);
    session.state = sessionData.state;
    session.scope = sessionData.scope;
    session.accessToken = sessionData.accessToken;
    session.expires = sessionData.expires ? new Date(sessionData.expires) : undefined;
    session.onlineAccessInfo = sessionData.onlineAccessInfo || null;

    console.log("✅ Loaded session:", id);
    return session;
  } catch (err) {
    console.error("❌ Failed to load session:", err);
    return undefined;
  }
};

const deleteCallback = async (id) => {
  try {
    const sessions = loadSessions();
    if (sessions[id]) {
      delete sessions[id];
      saveSessions(sessions);
      console.log("🗑️ Deleted session:", id);
    } else {
      console.warn("⚠️ Tried to delete nonexistent session:", id);
    }
    return true;
  } catch (err) {
    console.error("❌ Failed to delete session:", err);
    return false;
  }
};

module.exports = {
  storeCallback,
  loadCallback,
  deleteCallback,
};
