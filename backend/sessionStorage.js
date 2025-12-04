const fs = require("fs");
const path = require("path");
const { Session } = require("@shopify/shopify-api");

const SESSIONS_FILE = path.join(__dirname, "sessions.json");

function ensureFile() {
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}), "utf8");
  }
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
  // ✅ Store session to file
  storeCallback: async (session) => {
    if (!session.shop) {
      console.error("Invalid session object:", session);
      return false;
    }
  
    let id;
    if (session.isOnline) {
      // Online session ID must include shop + user id
      const userId = session.onlineAccessInfo?.associated_user?.id;
      if (!userId) {
        console.error("No associated user ID for online session");
        return false;
      }
      id = `online_${session.shop}_${userId}`;
    } else {
      // Offline session
      id = `offline_${session.shop}`;
    }
    session.id = id;
  
    const sessions = loadSessions();
    sessions[id] = {
      id,
      shop: session.shop,
      isOnline: session.isOnline,
      accessToken: session.accessToken,
      scope: session.scope,
      expires: session.expires ? session.expires.toISOString() : null,
      onlineAccessInfo: session.onlineAccessInfo || null,
    };
  
    saveSessions(sessions);
    console.log("✅ Stored session:", id);
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

  // ✅ NEW: Return all stored sessions
  getAllSessions: async () => {
    const sessions = loadSessions();
    return Object.values(sessions);
  },
};
