/**
 * models/Cart.js – Mongoose schema & model for the Cart collection
 *
 * Schema design rationale:
 *   • userId is indexed for fast lookups (each user has exactly one cart).
 *   • items is an embedded subdocument array – simple for a microservice that
 *     owns its own data and doesn't need cross-collection joins.
 *   • total is a computed convenience field recalculated on every mutation.
 *   • updatedAt tracks the last modification timestamp.
 */

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, default: 'Unknown Product' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, default: 0 },
  },
  { _id: true } // Mongoose generates _id for each sub-doc (useful for removal)
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    items: [cartItemSchema],
    total: { type: Number, default: 0 },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

/**
 * Recalculate the cart total from items.
 * Called before every save so the total always stays in sync.
 */
cartSchema.pre('save', function (next) {
  this.total = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
