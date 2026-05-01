import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getBookById } from '../services/api';

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await getBookById(id);
        setBook(data.book);
      } catch (err) {
        setError(err.response?.data?.message || 'Book not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleAddToCart = () => {
    if (!book || book.stock === 0) {
      return;
    }

    addToCart(book, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-12 h-12 border-4 rounded-full animate-spin border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Book not found</h1>
        <p className="max-w-lg mt-3 text-slate-500">{error}</p>
        <button type="button" onClick={() => navigate('/books')} className="mt-6 btn-primary">
          Back to catalog
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate('/books')}
        className="mb-8 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        Back to books
      </button>

      <div className="grid gap-12 lg:grid-cols-[minmax(320px,420px)_1fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg">
          <div className="aspect-[3/4] overflow-hidden bg-slate-100">
            <img src={book.image} alt={book.title} className="object-cover w-full h-full" />
          </div>
        </div>

        <div>
          <span className="inline-flex px-4 py-2 text-sm font-semibold rounded-full bg-brand-50 text-brand-700">
            {book.category}
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            {book.title}
          </h1>
          <p className="mt-3 text-xl text-slate-500">
            by <span className="font-semibold text-slate-700">{book.author}</span>
          </p>

          <div className="mt-8 grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Price</p>
              <p className="mt-2 text-3xl font-bold text-brand-600">Rs. {Number(book.price).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Availability</p>
              <p className={`mt-2 text-lg font-bold ${book.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {book.stock > 0 ? `${book.stock} copies available` : 'Out of stock'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Catalog ID</p>
              <p className="mt-2 font-mono text-sm truncate text-slate-500">{book._id}</p>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">Description</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">{book.description}</p>
          </div>

          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div>
                <label className="label">Quantity</label>
                <div className="flex items-center w-32 h-12 overflow-hidden bg-white border rounded-xl border-slate-300">
                  <button
                    type="button"
                    disabled={quantity <= 1 || book.stock === 0}
                    className="flex items-center justify-center w-10 h-full transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40"
                    onClick={() => setQuantity((current) => current - 1)}
                  >
                    -
                  </button>
                  <div className="flex-1 font-bold text-center border-x border-slate-200 text-slate-800">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    disabled={quantity >= book.stock || book.stock === 0}
                    className="flex items-center justify-center w-10 h-full transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40"
                    onClick={() => setQuantity((current) => current + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={book.stock === 0}
                className={`h-12 flex-1 rounded-xl font-semibold transition-all ${
                  added ? 'bg-emerald-600 text-white' : 'btn-primary'
                }`}
              >
                {added ? 'Added to cart' : 'Add to cart'}
              </button>
            </div>

            {added && (
              <div className="mt-4">
                <Link to="/cart" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Go to cart
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;
//test frontend