import { useEffect, useState } from 'react';
import BookCard from '../components/books/BookCard';
import { getBooks } from '../services/api';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await getBooks();
        setBooks(data.books);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load books right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const categories = ['All', ...new Set(books.map((book) => book.category))];
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredBooks = books.filter((book) => {
    const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
    const matchesSearch = !normalizedSearch
      || book.title.toLowerCase().includes(normalizedSearch)
      || book.author.toLowerCase().includes(normalizedSearch)
      || book.description.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 px-6 py-12 text-white shadow-2xl sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
          Books
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Explore the full bookstore catalog
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-300">
          Search by title or author, filter by category, and open any book to see
          its full details and stock status.
        </p>
      </div>

      <div className="mt-10 grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[2fr_1fr]">
        <div>
          <label className="label">Search books</label>
          <input
            type="text"
            className="input-field"
            placeholder="Search by title, author, or description"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="input-field"
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {loading ? 'Loading catalog...' : `${filteredBooks.length} books available`}
        </p>
        {(searchTerm || activeCategory !== 'All') && (
          <button
            type="button"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('All');
            }}
          >
            Reset filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800">No books matched your filters</h2>
          <p className="mt-3 text-slate-500">
            Try a different keyword or switch back to all categories.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <BookCard key={book._id} book={book} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
};

export default BooksPage;
