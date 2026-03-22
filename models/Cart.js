const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, default: 'Unknown Product' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, default: 0 },
    images: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
      },
    ],
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    items: [cartItemSchema],
    total: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

cartSchema.pre('save', function (next) {
  this.total = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
