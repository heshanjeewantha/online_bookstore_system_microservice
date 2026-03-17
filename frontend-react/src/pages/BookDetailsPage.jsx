import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBookById } from '../mocks/books';
import { useCart } from '../context/CartContext';

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
        setBook(data);
      } catch (err) {
        setError('Book not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleAddToCart = () => {
    if (!book || book.stock === 0) return;
    addToCart(book, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4 text-slate-300">📚</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Book Not Found</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="text-brand-600 hover:text-brand-700 font-medium mb-8 flex items-center gap-2 transition-colors">
        <span>←</span> Back to Books
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image Column */}
        <div className="w-full lg:w-1/3 max-w-sm mx-auto lg:mx-0">
          <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white border border-slate-200 group">
             <div className="aspect-[2/3] w-full">
               <img 
                 src={book.imageUrl} 
                 alt={book.title} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
               />
             </div>
             {book.stock === 0 && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                   <span className="bg-red-500 text-white font-bold py-2 px-6 rounded-full -rotate-12 text-lg shadow-xl border-2 border-red-600">
                     OUT OF STOCK
                   </span>
                </div>
             )}
          </div>
        </div>

        {/* Details Column */}
        <div className="w-full lg:w-2/3 flex flex-col">
           <div className="mb-4 inline-block">
             <span className="bg-brand-50 text-brand-700 border border-brand-200 font-bold px-3 py-1 rounded-full text-xs tracking-wide">
               {book.category}
             </span>
           </div>
           
           <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 mb-2 leading-tight">
             {book.title}
           </h1>
           <p className="text-xl text-slate-500 font-medium mb-6">by <span className="text-slate-700">{book.author}</span></p>

           <div className="text-3xl font-bold text-brand-600 mb-8">
             Rs. {book.price.toLocaleString()}
           </div>

           <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 relative overflow-hidden">
             <h3 className="text-slate-800 font-bold mb-3">Synopsis</h3>
             <p className="text-slate-600 leading-relaxed text-sm md:text-base">{book.description}</p>
           </div>

           {/* Add to Cart Actions */}
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
             <div className="flex items-center gap-4 mb-6">
                <div>
                   <p className="text-slate-500 text-sm mb-1 font-semibold">Availability</p>
                   {book.stock > 0 ? (
                      <p className="text-emerald-600 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        In Stock ({book.stock} copies)
                      </p>
                   ) : (
                     <p className="text-red-500 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        Currently Unavailable
                      </p>
                   )}
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                <div className="w-full sm:w-auto">
                  <label className="block text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Quantity</label>
                  <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden h-12 w-32 shadow-sm">
                     <button 
                       disabled={quantity <= 1 || book.stock === 0}
                       onClick={() => setQuantity(q => q - 1)}
                       className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 transition-colors"
                     >-</button>
                     <div className="flex-1 text-center font-bold text-slate-800 select-none border-x border-slate-200 h-full flex items-center justify-center">{quantity}</div>
                     <button 
                       disabled={quantity >= book.stock || book.stock === 0}
                       onClick={() => setQuantity(q => q + 1)}
                       className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 transition-colors"
                     >+</button>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={book.stock === 0}
                  className={`flex-1 h-12 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                    ${added ? 'bg-emerald-600 text-white border border-emerald-500' : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-95'}
                  `}
                >
                  {added ? (
                    <><span>✅</span> Added to Cart!</>
                  ) : (
                    <><span>🛒</span> Add to Cart</>
                  )}
                </button>
             </div>
             
             {/* Go to cart CTA if items are in cart */}
             {added && (
               <div className="mt-4 text-center animate-fade-in">
                 <Link to="/cart" className="text-brand-600 hover:text-brand-700 text-sm font-bold underline underline-offset-4 cursor-pointer">
                   View Cart and Checkout →
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
