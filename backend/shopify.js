// shopify.js
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { RedisSessionStorage } = require('shopify-app-session-storage-redis');
const Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL);

const sessionStorage = new RedisSessionStorage(redisClient);

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.HOST.replace(/^https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage,
});

module.exports = { shopify, sessionStorage };

