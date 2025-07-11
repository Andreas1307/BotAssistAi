// verifyHMAC.js
const crypto = require('crypto');

function verifyHMAC(query, secret) {
  const { hmac, ...params } = query;
  const message = Object.keys(params)
    .sort()
    .map((key) => `${key}=${Array.isArray(params[key]) ? params[key].join(',') : params[key]}`)
    .join('&');

  const generated = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  return generated === hmac;
}

module.exports = verifyHMAC;
