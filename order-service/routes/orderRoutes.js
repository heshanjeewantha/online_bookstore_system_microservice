const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getPendingPaymentCount,
  getOrderById,
  approveOrder,
  cancelOrder,
  updateShipmentStatus,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.bookId')
    .trim()
    .notEmpty()
    .withMessage('Each item must have a bookId'),
  body('items.*.title')
    .trim()
    .notEmpty()
    .withMessage('Each item must have a title'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item quantity must be at least 1'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Each item price must be 0 or greater'),
];

// User routes
router.post('/', protect, createOrderValidation, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/pending-payment-count', protect, getPendingPaymentCount);

// Admin routes
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/approve', protect, adminOnly, approveOrder);
router.put('/:id/cancel', protect, adminOnly, cancelOrder);
router.put('/:id/shipment', protect, adminOnly, updateShipmentStatus);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
