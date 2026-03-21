const Cart = require('../models/Cart');
const apiResponse = require('../helpers/apiResponse');
const { callViaGateway } = require('../helpers/gatewayFunc');

exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    return apiResponse.success(res, 'Cart retrieved successfully', cart);
  } catch (err) {
    console.error('[getCart] Error:', err.message);
    return apiResponse.error(res, 'Failed to retrieve cart');
  }
};

exports.addItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    let productName = 'Unknown Product';
    let productPrice = 0;

    // Fetch Product Details via Gateway
    try {
      const productData = await callViaGateway(
        'GET',
        `/inventory/products/${productId}`,
        {},
        req.headers
      );

      productPrice = productData.price ?? 0;
      productName = productData.name ?? 'Unknown Product';
      console.log(
        `[addItem] Product fetched via gateway – name: ${productName}, price: ${productPrice}`
      );
    } catch (gatewayErr) {
      console.warn(
        `[addItem] Product service unavailable via gateway (${gatewayErr.message}). Using fallback price.`
      );
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].price = productPrice;
      cart.items[existingIndex].name = productName;
    } else {
      cart.items.push({
        productId,
        name: productName,
        quantity,
        price: productPrice,
      });
    }

    await cart.save();
    return apiResponse.success(res, 'Item added to cart', cart, 201);
  } catch (err) {
    console.error('[addItem] Error:', err.message);
    return apiResponse.error(res, 'Failed to add item to cart');
  }
};

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
