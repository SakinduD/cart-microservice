/**
 * controllers/cartController.js – Business logic for all cart operations
 *
 * Integration point (SE4010 assignment requirement):
 *   POST /cart/add calls the Product microservice via axios to fetch the
 *   real product price and name.  If the external call fails the service
 *   degrades gracefully by using a fallback price of 0 and logging the
 *   error – the cart is still created so the user experience is not blocked.
 *
 * This separation of concerns (controller ≠ route ≠ model) follows the
 * MVC pattern recommended for production Node.js services.
 */

const axios = require('axios');
const Cart = require('../models/Cart');
const config = require('../config');
const apiResponse = require('../helpers/apiResponse');

// ── GET /cart/:userId ──────────────────────────────────────────────────────
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId });

    // If no cart exists yet, create an empty one (requirement: "get or create")
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    return apiResponse.success(res, 'Cart retrieved successfully', cart);
  } catch (err) {
    console.error('[getCart] Error:', err.message);
    return apiResponse.error(res, 'Failed to retrieve cart');
  }
};

// ── POST /cart/add ─────────────────────────────────────────────────────────
exports.addItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // ── Integration point: fetch product details from Product service ──
    let productName = 'Unknown Product';
    let productPrice = 0; // fallback price if external call fails

    try {
      const productUrl = `${config.productServiceUrl}/products/${productId}`;
      console.log(`[addItem] Calling Product service: ${productUrl}`);
      const { data } = await axios.get(productUrl, { timeout: 5000 });

      // Adapt to however the Product service responds (common shapes)
      productPrice = data.price ?? data.data?.price ?? 0;
      productName = data.name ?? data.data?.name ?? 'Unknown Product';
      console.log(
        `[addItem] Product fetched – name: ${productName}, price: ${productPrice}`
      );
    } catch (extErr) {
      // Graceful degradation: log and continue with fallback values
      console.warn(
        `[addItem] Product service unavailable (${extErr.message}). Using fallback price.`
      );
    }

    // Find-or-create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // If the product already exists in the cart, update its quantity
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].price = productPrice; // refresh price
      cart.items[existingIndex].name = productName;
    } else {
      cart.items.push({
        productId,
        name: productName,
        quantity,
        price: productPrice,
      });
    }

    await cart.save(); // pre-save hook recalculates total
    return apiResponse.success(res, 'Item added to cart', cart, 201);
  } catch (err) {
    console.error('[addItem] Error:', err.message);
    return apiResponse.error(res, 'Failed to add item to cart');
  }
};

// ── DELETE /cart/remove ────────────────────────────────────────────────────
exports.removeItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return apiResponse.error(res, 'Cart not found', 404);
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    if (cart.items.length === initialLength) {
      return apiResponse.error(res, 'Item not found in cart', 404);
    }

    await cart.save();
    return apiResponse.success(res, 'Item removed from cart', cart);
  } catch (err) {
    console.error('[removeItem] Error:', err.message);
    return apiResponse.error(res, 'Failed to remove item');
  }
};

// ── DELETE /cart/clear/:userId ─────────────────────────────────────────────
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return apiResponse.error(res, 'Cart not found', 404);
    }

    cart.items = [];
    await cart.save();
    return apiResponse.success(res, 'Cart cleared', cart);
  } catch (err) {
    console.error('[clearCart] Error:', err.message);
    return apiResponse.error(res, 'Failed to clear cart');
  }
};
