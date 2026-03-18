const { validationResult } = require('express-validator');
const Order = require('../models/Order');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// @desc    Create a new order (user checkout)
// @route   POST /orders
// @access  Private (authenticated user)
const createOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { items, shippingAddress } = req.body;

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.bookId || !item.title) {
        throw createHttpError(400, 'Each item must have bookId and title');
      }
      if (!item.quantity || item.quantity < 1) {
        throw createHttpError(400, 'Quantity must be at least 1');
      }
      if (item.price === undefined || item.price < 0) {
        throw createHttpError(400, 'Price must be a valid number');
      }

      totalPrice += item.price * item.quantity;
      orderItems.push({
        bookId: item.bookId,
        title: item.title,
        author: item.author || '',
        image: item.image || '',
        quantity: item.quantity,
        price: item.price,
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      userName: req.body.userName || '',
      userEmail: req.body.userEmail || '',
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
const approveOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw createHttpError(404, 'Order not found');
    }

    if (order.orderStatus !== 'pending_approval') {
      throw createHttpError(400, `Cannot approve an order with status: ${order.orderStatus}`);
    }

    order.orderStatus = 'approved';
    if (req.body.adminNote) {
      order.adminNote = req.body.adminNote;
    }
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order approved successfully',
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
    const validStatuses = ['pending_approval', 'approved', 'shipped', 'delivered', 'cancelled'];

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
};
