const { validationResult } = require('express-validator');
const axios = require('axios');
const Book = require('../models/Book');

// ── Inter-service config ──────────────────────────────────────────────────────
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5003';
const INTERNAL_API_KEY  = process.env.INTERNAL_API_KEY  || '';

const internalHeaders = () => ({
  'x-internal-api-key': INTERNAL_API_KEY,
  'Content-Type': 'application/json',
});

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// @desc    Get all books (with optional search/category/sort)
// @route   GET /books
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const sortMap = {
      newest:    { createdAt: -1 },
      oldest:    { createdAt:  1 },
      priceAsc:  { price:      1 },
      priceDesc: { price:     -1 },
      titleAsc:  { title:      1 },
      titleDesc: { title:     -1 },
      bestSeller:{ totalSales:-1 },
    };

    const books = await Book.find(query).sort(sortMap[sort] || { createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top 10 best-selling books
//          Fetches totalSales counts from Order Service and updates local Book records,
//          then returns books sorted by totalSales descending.
// @route   GET /books/best-sellers
// @access  Public
const getBestSellers = async (req, res, next) => {
  try {
    // ── Inter-service call: ask Order Service for the sales count per book ──
    let salesMap = {}; // { bookId: totalQtySold }

    try {
      const response = await axios.get(
        `${ORDER_SERVICE_URL}/internal/orders/book-sales`,
        { headers: internalHeaders() }
      );

      if (response.data && response.data.sales) {
        salesMap = response.data.sales; // e.g. { "bookId1": 12, "bookId2": 5 }
      }
    } catch (orderErr) {
      // If Order Service is unavailable, fall back to our cached totalSales values
      console.warn(`[Book→Order] Could not fetch live sales data: ${orderErr.message}. Using cached values.`);
    }

    // Update totalSales on local books if we got fresh data
    if (Object.keys(salesMap).length > 0) {
      const updateOps = Object.entries(salesMap).map(([bookId, qty]) =>
        Book.findByIdAndUpdate(bookId, { totalSales: qty }, { new: false }).catch(() => null)
      );
      await Promise.all(updateOps);
    }

    const bestSellers = await Book.find({}).sort({ totalSales: -1 }).limit(10);

    res.status(200).json({
      success: true,
      count: bestSellers.length,
      books: bestSellers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book by ID
// @route   GET /books/:id
// @access  Public
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      throw createHttpError(404, 'Book not found');
    }

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new book
// @route   POST /books
// @access  Private/Admin
const createBook = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book
// @route   PUT /books/:id
// @access  Private/Admin
const updateBook = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      throw createHttpError(404, 'Book not found');
    }

    const allowedFields = ['title', 'author', 'price', 'category', 'description', 'stock', 'image'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        book[field] = req.body[field];
      }
    }

    const updatedBook = await book.save();

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book — SAFE DELETE via Order Service check
//          Calls Order Service to verify no active orders contain this book.
//          Blocks deletion if active orders exist.
// @route   DELETE /books/:id
// @access  Private/Admin
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      throw createHttpError(404, 'Book not found');
    }

    // ── Inter-service call: check if this book has any active orders ──
    try {
      const response = await axios.get(
        `${ORDER_SERVICE_URL}/internal/orders/check-book/${req.params.id}`,
        { headers: internalHeaders() }
      );

      if (response.data && response.data.hasActiveOrders) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete "${book.title}". It is part of ${response.data.count} active order(s). Cancel those orders first.`,
        });
      }
    } catch (orderErr) {
      if (orderErr.response && orderErr.response.status === 404) {
        // 404 from Order Service means "no active orders found" — safe to delete
      } else {
        // Order Service is down — block deletion to protect data integrity
        console.error(`[Book→Order] Safe-delete check failed: ${orderErr.message}`);
        return res.status(503).json({
          success: false,
          message: 'Cannot verify order status right now. Deletion blocked to protect data integrity. Try again later.',
        });
      }
    }

    // Safe to delete
    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBestSellers,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
