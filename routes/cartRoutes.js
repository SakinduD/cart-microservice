const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.get('/:userId', auth, cartController.getCart);

router.post('/add', auth, cartController.addItem);

router.delete('/remove', auth, cartController.removeItem);

router.delete('/clear/:userId', auth, cartController.clearCart);

module.exports = router;
