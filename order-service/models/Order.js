const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: [true, 'Book ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be at least 0'],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    userName: {
      type: String,
      trim: true,
      default: '',
    },
    userEmail: {
      type: String,
      trim: true,
      default: '',
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price must be at least 0'],
    },
    orderStatus: {
      type: String,
      enum: ['pending_approval', 'approved', 'shipped', 'delivered', 'cancelled'],
      default: 'pending_approval',
      index: true,
    },
    shippingAddress: {
      type: String,
      trim: true,
      default: '',
    },
    adminNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
