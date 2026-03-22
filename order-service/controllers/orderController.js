const { validationResult } = require('express-validator');
const axios = require('axios');
const Order = require('../models/Order');

const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:5002';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || '';

const internalHeaders = () => ({
  'x-internal-api-key': INTERNAL_API_KEY,
  'Content-Type': 'application/json',
});

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// @desc    Create a new order (user checkout)
// @route   POST /orders
// @access  Private (authenticated user)
// Inter-service: calls Book Service to validate books & prices, calls User Service to fetch user info
const createOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { items, shippingAddress } = req.body;

    // ── Inter-service call: Fetch user info from User Service ──
    let userName = req.body.userName || '';
    let userEmail = req.body.userEmail || '';

    try {
      const userResponse = await axios.get(
        `${USER_SERVICE_URL}/internal/users/${req.user.id}`,
        { headers: internalHeaders() }
      );
      if (userResponse.data.success) {
        userName = userResponse.data.user.name;
        userEmail = userResponse.data.user.email;
      }
    } catch (userErr) {
      console.warn(`[Order→User] Failed to fetch user info: ${userErr.message}`);
      // Continue with data from request body if user-service is unavailable
    }

    // ── Inter-service call: Validate books and get real prices from Book Service ──
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.bookId || !item.title) {
        throw createHttpError(400, 'Each item must have bookId and title');
      }
      if (!item.quantity || item.quantity < 1) {
        throw createHttpError(400, 'Quantity must be at least 1');
      }

      let bookPrice = item.price;
      let bookTitle = item.title;
      let bookAuthor = item.author || '';
      let bookImage = item.image || '';

      try {
        const bookResponse = await axios.get(
          `${BOOK_SERVICE_URL}/internal/books/${item.bookId}`,
          { headers: internalHeaders() }
        );

        if (bookResponse.data.success) {
          const book = bookResponse.data.book;
          // Use actual price from book-service (prevents price tampering)
          bookPrice = book.price;
          bookTitle = book.title;
          bookAuthor = book.author;
          bookImage = book.image;

          // Validate stock availability
          if (book.stock < item.quantity) {
            throw createHttpError(
              400,
              `Insufficient stock for "${book.title}". Available: ${book.stock}, requested: ${item.quantity}`
            );
          }
        }
      } catch (bookErr) {
        // If it's our own HTTP error (stock issue), re-throw it
        if (bookErr.statusCode) {
          throw bookErr;
        }
        console.warn(`[Order→Book] Failed to validate book ${item.bookId}: ${bookErr.message}`);
        // If book-service is unavailable, fall back to client-provided data
        if (bookPrice === undefined || bookPrice < 0) {
          throw createHttpError(400, 'Price must be a valid number');
        }
      }

      totalPrice += bookPrice * item.quantity;
      orderItems.push({
        bookId: item.bookId,
        title: bookTitle,
        author: bookAuthor,
        image: bookImage,
        quantity: item.quantity,
        price: bookPrice,
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      userName,
      userEmail,
      items: orderItems,
      totalPrice,
      shippingAddress: shippingAddress || '',
      orderStatus: 'pending_approval',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Awaiting admin approval.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for logged-in user
// @route   GET /orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get count of approved orders awaiting payment for logged-in user
// @route   GET /orders/pending-payment-count
// @access  Private
const getPendingPaymentCount = async (req, res, next) => {
  try {
    const count = await Order.countDocuments({
      userId: req.user.id,
      orderStatus: 'approved',
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /orders/:id
// @access  Private (owner or admin)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw createHttpError(404, 'Order not found');
    }

    // Only allow the owner or an admin to view the order
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      throw createHttpError(403, 'Not authorized to view this order');
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin approve an order
// @route   PUT /orders/:id/approve
// @access  Private/Admin
// Inter-service: calls Book Service to decrement stock for each item
const approveOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw createHttpError(404, 'Order not found');
    }

    if (order.orderStatus !== 'pending_approval') {
      throw createHttpError(400, `Cannot approve an order with status: ${order.orderStatus}`);
    }

    // ── Inter-service call: Decrement stock in Book Service for each item ──
    const stockErrors = [];
    for (const item of order.items) {
      try {
        await axios.put(
          `${BOOK_SERVICE_URL}/internal/books/${item.bookId}/decrement-stock`,
          { quantity: item.quantity },
          { headers: internalHeaders() }
        );
      } catch (stockErr) {
        const msg = stockErr.response?.data?.message || stockErr.message;
        stockErrors.push(`Book "${item.title}": ${msg}`);
      }
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to decrement stock for some items',
        errors: stockErrors,
      });
    }

    order.orderStatus = 'approved';
    if (req.body.adminNote) {
      order.adminNote = req.body.adminNote;
    }
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order approved successfully. Stock updated in Book Service.',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin cancel an order
// @route   PUT /orders/:id/cancel
// @access  Private/Admin
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw createHttpError(404, 'Order not found');
    }

    if (order.orderStatus === 'delivered') {
      throw createHttpError(400, 'Cannot cancel a delivered order');
    }

    order.orderStatus = 'cancelled';
    if (req.body.adminNote) {
      order.adminNote = req.body.adminNote;
    }
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update shipment status
// @route   PUT /orders/:id/shipment
// @access  Private/Admin
const updateShipmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validShipmentStatuses = ['shipped', 'delivered'];

    if (!validShipmentStatuses.includes(status)) {
      throw createHttpError(400, `Invalid shipment status. Must be one of: ${validShipmentStatuses.join(', ')}`);
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw createHttpError(404, 'Order not found');
    }

    if (order.orderStatus === 'pending_approval') {
      throw createHttpError(400, 'Order must be approved before updating shipment');
    }

    if (order.orderStatus === 'cancelled') {
      throw createHttpError(400, 'Cannot update shipment for a cancelled order');
    }

    order.orderStatus = status;
    if (req.body.adminNote) {
      order.adminNote = req.body.adminNote;
    }
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order shipment updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update order status (general)
// @route   PUT /orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending_approval', 'approved', 'paid', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw createHttpError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw createHttpError(404, 'Order not found');
    }

    order.orderStatus = status;
    if (req.body.adminNote) {
      order.adminNote = req.body.adminNote;
    }
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    [INTERNAL] Check if a book has any active (non-cancelled) orders
//          Called by Book Service before deleting a book — Safe Delete
// @route   GET /internal/orders/check-book/:bookId
// @access  Internal only (x-internal-api-key)
const checkBookInOrders = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const activeStatuses = ['pending_approval', 'approved', 'shipped'];

    const count = await Order.countDocuments({
      'items.bookId': bookId,
      orderStatus: { $in: activeStatuses },
    });

    return res.status(200).json({
      success: true,
      hasActiveOrders: count > 0,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    [INTERNAL] Get total quantity sold per book across all delivered/paid orders
//          Called by Book Service to compute Best Sellers
// @route   GET /internal/orders/book-sales
// @access  Internal only (x-internal-api-key)
const getBookSales = async (req, res, next) => {
  try {
    const pipeline = [
      // Only count completed orders
      { $match: { orderStatus: { $in: ['shipped', 'delivered', 'approved'] } } },
      // Unwind items array so each item is a separate document
      { $unwind: '$items' },
      // Group by bookId, summing quantities
      {
        $group: {
          _id: '$items.bookId',
          totalSold: { $sum: '$items.quantity' },
        },
      },
    ];

    const results = await Order.aggregate(pipeline);

    // Convert array to a map: { bookId: totalSold }
    const sales = {};
    results.forEach(({ _id, totalSold }) => {
      if (_id) sales[_id] = totalSold;
    });

    return res.status(200).json({ success: true, sales });
  } catch (error) {
    next(error);
  }
};

// @desc    [INTERNAL] Check if a user has any active (non-cancelled) orders
//          Called by User Service before deleting an account — Safe Account Deletion
// @route   GET /internal/orders/check-user/:userId
// @access  Internal only (x-internal-api-key)
const checkActiveOrdersByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const activeStatuses = ['pending_approval', 'approved', 'shipped'];

    const count = await Order.countDocuments({
      userId,
      orderStatus: { $in: activeStatuses },
    });

    return res.status(200).json({
      success: true,
      hasActiveOrders: count > 0,
      count,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getPendingPaymentCount,
  getOrderById,
  approveOrder,
  cancelOrder,
  updateShipmentStatus,
  updateOrderStatus,
  checkBookInOrders,
  getBookSales,
  checkActiveOrdersByUser,
};
