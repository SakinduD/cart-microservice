/**
 * server.js – Main entry point for the Cart Microservice
 *
 * SE4010 – Current Trends in Software Engineering (2026)
 * This Express application exposes REST endpoints for managing a user's
 * shopping cart and integrates with the Product microservice to fetch
 * real product prices.
 *
 * Security decisions:
 *   • All secrets (MONGODB_URI, PRODUCT_SERVICE_URL) loaded via dotenv
 *   • Input validation on every mutating endpoint (express-validator)
 *   • CORS enabled for cross-origin consumption
 *   • Basic request logging for auditability
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const config = require('./config');
const cartRoutes = require('./routes/cartRoutes');

// ──────────────────────────────── bootstrap ────────────────────────────────

dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json()); // built-in body parser – no need for body-parser pkg

// Basic request logger – prints method, url and timestamp for every request
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/cart', cartRoutes);

// Health-check endpoint (useful for ECS health checks)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cart-microservice' });
});

// ── Database connection & server start ─────────────────────────────────────
const MONGODB_URI = config.mongodbUri;

if (!MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not set in environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✔  MongoDB connected');
    app.listen(config.port, () => {
      console.log(`✔  Cart service running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app; // exported for potential testing
