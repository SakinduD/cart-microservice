/**
 * routes/cartRoutes.js – Express router for /cart endpoints
 *
 * Each route applies its validation middleware (from middleware/validate.js)
 * before delegating to the controller.  This keeps routes thin and testable.
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const {
  addItemRules,
  removeItemRules,
  userIdParamRules,
} = require('../middleware/validate');

// GET  /cart/:userId        → retrieve (or create) a user's cart
router.get('/:userId', userIdParamRules, cartController.getCart);

// POST /cart/add            → add item to cart (integrates with Product service)
router.post('/add', addItemRules, cartController.addItem);

// DELETE /cart/remove       → remove a specific item from the cart
router.delete('/remove', removeItemRules, cartController.removeItem);

// DELETE /cart/clear/:userId → empty the entire cart
router.delete('/clear/:userId', userIdParamRules, cartController.clearCart);

module.exports = router;
