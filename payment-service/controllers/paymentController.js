const { validationResult } = require('express-validator');
const axios = require('axios');
const Payment = require('../models/Payment');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5003';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || '';

const internalHeaders = () => ({
  'x-internal-api-key': INTERNAL_API_KEY,
  'Content-Type': 'application/json',
});

const buildTransactionId = () => `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

// @desc    Create/process a payment
// @route   POST /payments
// @access  Private
// Inter-service: calls Order Service to verify order exists and is approved, then updates order status to 'paid'
const processPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { orderId, userId, amount, paymentMethod, currency } = req.body;

  // Non-admin users can only submit payments for themselves.
  if (req.user.role !== 'admin' && req.user._id !== userId) {
    return res.status(403).json({ message: 'You can only create payments for your own account' });
  }

  try {
    // ── Inter-service call: Verify order exists and is approved in Order Service ──
    try {
      const orderResponse = await axios.get(
        `${ORDER_SERVICE_URL}/internal/orders/${orderId}`,
        { headers: internalHeaders() }
      );
      
      if (orderResponse.data.success) {
        const order = orderResponse.data.order;
        if (order.orderStatus !== 'approved') {
          return res.status(400).json({ 
            success: false, 
            message: `Cannot process payment. Order status is '${order.orderStatus}'. Must be 'approved'.` 
          });
        }
        
        // Ensure user paying is the order owner
        if (order.userId !== userId && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Order belongs to a different user' });
        }
      }
    } catch (orderErr) {
      if (orderErr.response && orderErr.response.status === 404) {
        return res.status(404).json({ message: 'Order not found in Order Service' });
      }
      console.warn(`[Payment→Order] Failed to verify order: ${orderErr.message}`);
      // Based on strictness, we might block or proceed if order service is down
      // Let's block it since payment is sensitive
      return res.status(503).json({ message: 'Order verification failed. Order Service unavailable.' });
    }

    // Process payment
    const payment = await Payment.create({
      orderId,
      userId,
      amount,
      paymentMethod,
      currency,
      paymentStatus: amount > 0 ? 'paid' : 'failed',
      transactionId: amount > 0 ? buildTransactionId() : null,
    });

    // ── Inter-service call: Update order status to 'paid' in Order Service ──
    if (payment.paymentStatus === 'paid') {
      try {
        await axios.put(
          `${ORDER_SERVICE_URL}/internal/orders/${orderId}/mark-paid`,
          { transactionId: payment.transactionId },
          { headers: internalHeaders() }
        );
      } catch (markPaidErr) {
        console.error(`[Payment→Order] Failed to mark order as paid: ${markPaidErr.message}`);
        // Consider this a warning, payment succeeded locally but order status not updated
        // You'd typically use a message broker / queue here to ensure retry
      }
    }

    return res.status(201).json({
      success: true,
      message: payment.paymentStatus === 'paid' ? 'Payment processed successfully' : 'Payment failed',
      payment,
    });
  } catch (error) {
    console.error('Process Payment Error:', error.message);
    return res.status(500).json({ message: 'Server error while processing payment' });
  }
};

// @desc    Get payments by user
// @route   GET /payments/:userId
// @access  Private
const getPaymentsByUser = async (req, res) => {
  const { userId } = req.params;

  if (req.user.role !== 'admin' && req.user._id !== userId) {
    return res.status(403).json({ message: 'You can only view your own payments' });
  }

  try {
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error('Get Payments By User Error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching payments' });
  }
};

// @desc    Get all payments
// @route   GET /payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error('Get All Payments Error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching all payments' });
  }
};


// @desc    [INTERNAL] Check if a user has any processing/pending payments
//          Called by User Service before deleting an account — Safe Account Deletion
// @route   GET /internal/payments/check-user/:userId
// @access  Internal only (x-internal-api-key)
const checkProcessingPaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Payment.countDocuments({
      userId,
      paymentStatus: 'processing',
    });

    return res.status(200).json({
      success: true,
      hasProcessingPayments: count > 0,
      count,
    });
  } catch (error) {
    console.error('Check Processing Payments Error:', error.message);
    return res.status(500).json({ message: 'Server error checking payments' });
  }
};

module.exports = {
  processPayment,
  getPaymentsByUser,
  getAllPayments,
  checkProcessingPaymentsByUser,
};
