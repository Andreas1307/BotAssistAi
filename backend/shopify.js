const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');
require('dotenv').config();

const sessionStorage = require('./sessionStorage'); // 👈 replace this

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const rawHost = process.env.HOST;

if (!apiKey || !apiSecret || !rawHost) {
  throw new Error('Missing required Shopify environment variables');
}

const hostName = rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '');

const shopify = shopifyApi({
  apiKey,
  apiSecretKey: apiSecret,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostName,
  sessionStorage, // 👈 use file-based session storage here
});

module.exports = { shopify, sessionStorage };
