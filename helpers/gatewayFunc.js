const axios = require('axios');

// Helper: make authenticated call via gateway
async function callViaGateway(method, path, data = {}, headers = {}) {
  try {
    const config = {
      method,
      url: `${process.env.GATEWAY_URL}${path}`,
      headers: { Authorization: headers.authorization || '' }
    };

    if (data && Object.keys(data).length > 0) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (err) {
    console.error(`Gateway call failed: ${path}`, err.message);
    throw err;
  }
}

module.exports = { callViaGateway };