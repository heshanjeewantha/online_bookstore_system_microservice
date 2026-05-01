const express = require('express');
const Book = require('../models/Book');
const { internalAuth } = require('../middleware/internalAuth');

const router = express.Router();

// @desc    Get book info by ID (for inter-service communication)
// @route   GET /internal/books/:id
// @access  Internal (service-to-service only)
router.get('/:id', internalAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select('title author price stock image');

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({
      success: true,
      book: {
        _id: book._id,
        title: book.title,
        author: book.author,
        price: book.price,
        stock: book.stock,
        image: book.image,
      },
    });
  } catch (error) {
    console.error(`Internal get book error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch book info' });
  }
});

// @desc    Decrement book stock (called by order-service when an order is approved)
// @route   PUT /internal/books/:id/decrement-stock
// @access  Internal (service-to-service only)
router.put('/:id/decrement-stock', internalAuth, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${book.title}". Available: ${book.stock}, requested: ${quantity}`,
      });
    }

    book.stock -= quantity;
    await book.save();

    res.status(200).json({
      success: true,
      message: `Stock decremented by ${quantity} for "${book.title}"`,
      remainingStock: book.stock,
    });
  } catch (error) {
    console.error(`Internal decrement stock error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to decrement stock' });
  }
});

// @desc    Increment book sales (called by order-service when an order is approved)
// @route   PUT /internal/books/:id/increment-sales
// @access  Internal (service-to-service only)
router.put('/:id/increment-sales', internalAuth, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    book.totalSales = (book.totalSales || 0) + quantity;
    await book.save();

    res.status(200).json({
      success: true,
      message: `Sales incremented by ${quantity} for "${book.title}"`,
      totalSales: book.totalSales,
    });
  } catch (error) {
    console.error(`Internal increment sales error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to increment sales' });
  }
});

module.exports = router;
