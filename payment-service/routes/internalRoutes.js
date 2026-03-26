const express = require('express');
const { checkProcessingPaymentsByUser } = require('../controllers/paymentController');
const { internalOnly } = require('../middleware/internalMiddleware');

const router = express.Router();

// @desc    Check if a user has any processing payments
//          Called by User Service before allowing account deletion
// @route   GET /internal/payments/check-user/:userId
// @access  Internal (x-internal-api-key)
router.get('/check-user/:userId', internalOnly, checkProcessingPaymentsByUser);

module.exports = router;
