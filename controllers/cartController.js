const Cart = require('../models/Cart');
const apiResponse = require('../helpers/apiResponse');
const { callViaGateway } = require('../helpers/gatewayFunc');

const sanitizeTextInput = (value, fieldName) => {
  if (typeof value !== 'string') {
    return {
      error: `${fieldName} must be a string`,
      statusCode: 400,
    };
  }

  const sanitizedValue = value.trim();

  if (!sanitizedValue) {
    return {
      error: `${fieldName} is required`,
      statusCode: 400,
    };
  }

  if (sanitizedValue.includes('\0')) {
    return {
      error: `${fieldName} contains invalid characters`,
      statusCode: 400,
    };
  }

  return { value: sanitizedValue };
};

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

    if (!userId || !productId || !quantity) {
      return apiResponse.error(
        res,
        'userId, productId and quantity are required',
        400
      );
    }

    const sanitizedUserId = sanitizeTextInput(userId, 'userId');
    if (sanitizedUserId.error) {
      return apiResponse.error(res, sanitizedUserId.error, sanitizedUserId.statusCode);
    }

    const sanitizedProductId = sanitizeTextInput(productId, 'productId');
    if (sanitizedProductId.error) {
      return apiResponse.error(res, sanitizedProductId.error, sanitizedProductId.statusCode);
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return apiResponse.error(res, 'quantity must be a positive integer', 400);
    }

    let productName;
    let productPrice = 0;
    let productImages = [];

    // Fetch Product Details via Gateway
    try {
      const path = `/inventory/products/${sanitizedProductId.value}`;
      const productApi = await callViaGateway('GET', path, {}, req.headers);

      const productData = productApi?.product;

      if (!productData) {
        return apiResponse.error(res, 'Product not found', 404);
      }

      productPrice = Number(productData?.price ?? 0);
      productName = productData?.name ?? 'Unknown Product';
      productImages = Array.isArray(productData?.images)
        ? productData.images.map((image) => ({
            url: image?.url ?? '',
            publicId: image?.publicId ?? '',
          }))
        : [];

      console.log(
        `[addItem] Product fetched via gateway path ${path} – id: ${productData?._id || 'N/A'}, name: ${productName}, price: ${productPrice}`
      );
    } catch (gatewayErr) {
      const statusCode = gatewayErr?.response?.status || 502;
      const message =
        gatewayErr?.response?.data?.message || 'Failed to fetch product details';
      console.warn(`[addItem] Product lookup failed: ${gatewayErr.message}`);
      return apiResponse.error(res, message, statusCode);
    }

    let cart = await Cart.findOne({ userId: sanitizedUserId.value });
    if (!cart) {
      cart = new Cart({ userId: sanitizedUserId.value, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId === sanitizedProductId.value
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += parsedQuantity;
      cart.items[existingIndex].price = productPrice;
      cart.items[existingIndex].name = productName;
      cart.items[existingIndex].images = productImages;
    } else {
      cart.items.push({
        productId: sanitizedProductId.value,
        name: productName,
        quantity: parsedQuantity,
        price: productPrice,
        images: productImages,
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

    const sanitizedUserId = sanitizeTextInput(userId, 'userId');
    if (sanitizedUserId.error) {
      return apiResponse.error(res, sanitizedUserId.error, sanitizedUserId.statusCode);
    }

    const sanitizedProductId = sanitizeTextInput(productId, 'productId');
    if (sanitizedProductId.error) {
      return apiResponse.error(res, sanitizedProductId.error, sanitizedProductId.statusCode);
    }

    const cart = await Cart.findOne({ userId: sanitizedUserId.value });
    if (!cart) {
      return apiResponse.error(res, 'Cart not found', 404);
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.productId !== sanitizedProductId.value
    );

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
