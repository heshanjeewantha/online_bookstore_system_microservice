const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

// ── Inter-service config ──────────────────────────────────────────────────────
const ORDER_SERVICE_URL   = process.env.ORDER_SERVICE_URL   || 'http://localhost:5003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004';
const INTERNAL_API_KEY    = process.env.INTERNAL_API_KEY    || '';

const internalHeaders = () => ({
  'x-internal-api-key': INTERNAL_API_KEY,
  'Content-Type': 'application/json',
});

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(`Register error: ${error.message}`);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error(`Get profile error: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, password } = req.body;

    if (name) {
      user.name = name;
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }

      user.email = email;
    }

    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();
    const token = generateToken(updatedUser);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error(`Update profile error: ${error.message}`);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error(`Get users error: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @desc    Delete a user account — SAFE DELETE via Order & Payment Service checks
//          Admin can delete any user; a user can delete their own account.
//          Blocked if the user has active orders OR processing payments.
// @route   DELETE /users/:id
// @access  Private (owner or admin)
const deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    // Only the account owner or admin can delete the account
    if (req.user._id.toString() !== targetId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this account' });
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ── Inter-service call 1: Check active orders in Order Service ────────────
    try {
      const orderResponse = await axios.get(
        `${ORDER_SERVICE_URL}/internal/orders/check-user/${targetId}`,
        { headers: internalHeaders() }
      );
      if (orderResponse.data.hasActiveOrders) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete account. This user has ${orderResponse.data.count} active order(s). Cancel all orders before deleting the account.`,
        });
      }
    } catch (orderErr) {
      console.error(`[User→Order] Safe-delete check failed: ${orderErr.message}`);
      return res.status(503).json({
        success: false,
        message: 'Cannot verify order status right now. Account deletion blocked to protect data integrity.',
      });
    }

    // ── Inter-service call 2: Check processing payments in Payment Service ────
    try {
      const paymentResponse = await axios.get(
        `${PAYMENT_SERVICE_URL}/internal/payments/check-user/${targetId}`,
        { headers: internalHeaders() }
      );
      if (paymentResponse.data.hasProcessingPayments) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete account. This user has ${paymentResponse.data.count} payment(s) still processing. Wait for them to complete first.`,
        });
      }
    } catch (paymentErr) {
      console.error(`[User→Payment] Safe-delete check failed: ${paymentErr.message}`);
      return res.status(503).json({
        success: false,
        message: 'Cannot verify payment status right now. Account deletion blocked to protect data integrity.',
      });
    }

    // All checks passed — safe to delete
    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'User account deleted successfully.',
    });
  } catch (error) {
    console.error(`Delete user error: ${error.message}`);
    return res.status(500).json({ message: 'Server error deleting user' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
};
