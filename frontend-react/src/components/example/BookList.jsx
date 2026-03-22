import React, { useEffect, useState } from 'react';
import { bookService } from '../../api/services/bookService';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await bookService.getAllBooks();
        // Handle varying backend response structures
        setBooks(Array.isArray(data) ? data : data.books || []);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || 'Failed to load books'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-xl text-gray-600 animate-pulse">Loading books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded text-center my-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Available Books</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {books.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            No books available at the moment.
          </p>
        ) : (
          books.map((book) => (
            <div
              key={book.id || book._id}
              className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <h3 className="font-bold text-xl mb-2 text-gray-800 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-gray-600 mb-3 text-sm">{book.author}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="font-extrabold text-blue-600 text-lg">
                  ${book.price}
                </span>
                <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm font-medium transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookList;
