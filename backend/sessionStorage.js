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
  const sessions = loadSessions();
  sessions[session.id] = session;
  saveSessions(sessions);
  console.log("💾 Session stored:", session.id);
  return true;
};

const loadCallback = async (id) => {
  const sessions = loadSessions();
  const sessionData = sessions[id];

  if (!sessionData) return undefined;

  const session = new Session(
    sessionData.id,
    sessionData.shop,
    sessionData.isOnline
  );

  Object.assign(session, sessionData);
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



  loadSession: loadCallback,
  storeSession: storeCallback,
  deleteSession: deleteCallback,
};
