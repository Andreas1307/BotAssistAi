// shopify.js
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.resolve(__dirname, 'sessions.json');

const normalizeShop = (shop) =>
  shop.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

const customSessionStorage = {
  storeSession: async (session) => {
    const sessions = loadSessions();
    const normalized = normalizeShop(session.shop);
    sessions[normalized] = session;
    saveSessions(sessions);
    return true;
  },

  loadSession: async (idOrShop) => {
    const sessions = loadSessions();
    return sessions[normalizeShop(idOrShop)] || null;
  },

  deleteSession: async (idOrShop) => {
    const sessions = loadSessions();
    delete sessions[normalizeShop(idOrShop)];
    saveSessions(sessions);
    return true;
  },
};

function loadSessions() {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(SESSIONS_FILE));
  } catch (err) {
    console.error("❌ Failed to load sessions:", err);
    return {};
  }
}

function saveSessions(sessions) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (err) {
    console.error("❌ Failed to save sessions:", err);
  }
}

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName: process.env.HOST.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  sessionStorage: customSessionStorage, // ✅ Use correct format
});

module.exports = { shopify };
