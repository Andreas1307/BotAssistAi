const axios = require('axios');

async function fetchWebhooks(shop, accessToken) {
  const response = await axios.get(`https://${shop}/admin/api/2023-10/webhooks.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });
  console.log('Fetching webhooks for:', shop);
  console.log('Access token is:', accessToken);
  
  return response.data.webhooks || [];
}

module.exports = fetchWebhooks;
