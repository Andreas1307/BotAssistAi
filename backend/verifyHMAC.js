// verifyHMAC.js
const crypto = require('crypto');

function verifyHMAC(query, secret) {
  const { hmac, ...rest } = query;
  const sorted = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join('&');

  const hash = crypto
    .createHmac('sha256', secret)
    .update(sorted)
    .digest('hex');

  return hash === hmac;
}

module.exports = verifyHMAC;
