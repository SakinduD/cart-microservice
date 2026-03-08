/**
 * config/index.js – Central configuration loader
 *
 * All environment-dependent values are read here so the rest of the app
 * never references process.env directly.  This makes it easy to swap
 * values for testing and keeps secrets out of application code.
 */

require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 8002,
  mongodbUri: process.env.MONGODB_URI || '',
  productServiceUrl:
    process.env.PRODUCT_SERVICE_URL ||
    'https://product-service-groupmate.azurecontainerapps.io',
};
