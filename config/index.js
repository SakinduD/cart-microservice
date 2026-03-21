require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 8002,
  mongodbUri: process.env.MONGODB_URI || '',
  productServiceUrl:
    process.env.PRODUCT_SERVICE_URL ||
    'https://product-service-groupmate.azurecontainerapps.io',
};
