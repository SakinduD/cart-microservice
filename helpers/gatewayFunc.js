const axios = require('axios');

function sanitizeGatewayPath(path) {
  if (typeof path !== 'string') {
    throw new Error('Gateway path must be a string');
  }

  const normalizedPath = path.trim();

  if (!normalizedPath.startsWith('/')) {
    throw new Error('Gateway path must start with /');
  }

  if (normalizedPath.includes('..') || normalizedPath.includes('\\')) {
    throw new Error('Gateway path contains invalid traversal characters');
  }

  return normalizedPath;
}

// Helper: make authenticated call via gateway
async function callViaGateway(method, path, data = {}, headers = {}) {
  try {
    const safePath = sanitizeGatewayPath(path);
    const requestUrl = new URL(safePath, process.env.GATEWAY_URL).toString();

    const config = {
      method,
      url: requestUrl,
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