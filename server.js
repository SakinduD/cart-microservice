const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { connectDB, port } = require('./config/db');
const cartRoutes = require('./routes/cartRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  next();
});

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/cart', cartRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cart-microservice' });
});

connectDB()
  .then(() => {
    console.log('✔  MongoDB connected');
    app.listen(port, () => {
      console.log(`✔  Cart service running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app; 
