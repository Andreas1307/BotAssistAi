const { shopify } = require("@shopify/shopify-api");
const sessionStorage = require("./shopifyStorage");

const customSessionStorage = {
  storeSession: sessionStorage.storeSession,
  loadSession: sessionStorage.loadSession,
  deleteSession: sessionStorage.deleteSession,
  findSessionsByShop: sessionStorage.findSessionsByShop,
};

module.exports = {
  shopify,
  customSessionStorage,
};
