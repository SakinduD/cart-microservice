const axios = require('axios');

async function callViaGateway(method, path, data = {}, headers = {}) {
  try {
    const response = await axios({
      method,
      url: `${process.env.GATEWAY_URL}${path}`,
      data,
      timeout: Number(process.env.GATEWAY_TIMEOUT_MS || 8000),
      headers: {
        Authorization: headers.authorization || '',
      },
    });

    return response.data;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.error(`Gateway call timed out: ${path}`, err.message);
    } else {
      console.error(`Gateway call failed: ${path}`, err.message);
    }
    throw err;
  }
}

module.exports = { callViaGateway };
