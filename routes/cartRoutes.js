const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const {
  addItemRules,
  removeItemRules,
  userIdParamRules,
} = require('../middleware/validate');

router.get('/:userId', userIdParamRules, cartController.getCart);

router.post('/add', addItemRules, cartController.addItem);

router.delete('/remove', removeItemRules, cartController.removeItem);

router.delete('/clear/:userId', userIdParamRules, cartController.clearCart);

module.exports = router;
