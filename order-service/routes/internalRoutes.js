const express = require('express');
const Order = require('../models/Order');
const { internalAuth } = require('../middleware/internalAuth');

const router = express.Router();

// @desc    Get order info by ID (for inter-service communication)
// @route   GET /internal/orders/:id
// @access  Internal (service-to-service only)
router.get('/:id', internalAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order: {
        _id: order._id,
        userId: order.userId,
        totalPrice: order.totalPrice,
        orderStatus: order.orderStatus,
        items: order.items,
      },
    });
  } catch (error) {
    console.error(`Internal get order error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch order info' });
  }
});

// @desc    Update order payment status (called by payment-service after successful payment)
// @route   PUT /internal/orders/:id/mark-paid
// @access  Internal (service-to-service only)
router.put('/:id/mark-paid', internalAuth, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot mark order as paid. Current status: ${order.orderStatus}. Order must be 'approved'.`,
      });
    }

    order.orderStatus = 'paid';
    order.paymentTransactionId = transactionId || '';
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order marked as paid successfully',
      order: {
        _id: updatedOrder._id,
        orderStatus: updatedOrder.orderStatus,
      },
    });
  } catch (error) {
    console.error(`Internal mark-paid error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to update order payment status' });
  }
});

module.exports = router;
