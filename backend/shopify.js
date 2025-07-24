// shopify.js
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.resolve(__dirname, 'sessions.json');

const normalizeShop = (shop) =>
  shop.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

function loadSessions() {
  if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(SESSIONS_FILE));
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

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
  findSessionsByShop: async (shop) => {
    const sessions = loadSessions();
    const normalized = normalizeShop(shop);
    return sessions[normalized] ? [sessions[normalized]] : [];
  },
};

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName: process.env.HOST.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  sessionStorage: customSessionStorage,
});

module.exports = { shopify, customSessionStorage };
