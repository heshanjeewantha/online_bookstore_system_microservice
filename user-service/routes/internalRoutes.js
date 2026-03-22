const express = require('express');
const User = require('../models/User');
const { internalAuth } = require('../middleware/internalAuth');

const router = express.Router();

// @desc    Get basic user info by ID (for inter-service communication)
// @route   GET /internal/users/:id
// @access  Internal (service-to-service only)
router.get('/:id', internalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email role');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`Internal get user error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch user info' });
  }
});

module.exports = router;
