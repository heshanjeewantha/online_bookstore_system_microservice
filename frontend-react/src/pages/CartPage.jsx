import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const itemsPayload = cartItems.map((item) => ({
        bookId: item._id,
        title: item.title,
        author: item.author || '',
        image: item.image || '',
        quantity: item.quantity,
        price: item.price,
      }));

      await createOrder({
        items: itemsPayload,
        userName: user.name || '',
        userEmail: user.email || '',
      });

      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-slate-50">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-md border-2 border-emerald-200">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Order Placed Successfully!</h2>
        <p className="text-slate-500 mb-2 max-w-md">
          Your order has been submitted and is awaiting admin approval.
        </p>
        <p className="text-slate-400 text-sm mb-8 max-w-md">
          Once an admin approves your order, you'll be notified and can proceed with payment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/dashboard/orders" className="btn-primary">View My Orders</Link>
          <Link to="/books" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
          <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3a1 1 0 00.7 1.7H17m0 0a2 2 0 110 4 2 2 0 010-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added any books yet.</p>
        <Link to="/books" className="btn-primary">Browse Books</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 border-l-4 border-brand-600 pl-4">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Subtotal</div>
            </div>

            <div className="divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div key={item._id} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center hover:bg-slate-50 transition-colors">
                  <div className="sm:col-span-6 flex items-start sm:items-center gap-4">
                    <img src={item.image} alt={item.title} className="w-16 h-24 object-cover rounded-md shadow-sm border border-slate-200" />
                    <div>
                      <Link to={`/book/${item._id}`} className="text-slate-800 font-bold hover:text-brand-600 transition-colors line-clamp-2 mb-1">
                        {item.title}
                      </Link>
                      <p className="text-slate-500 text-xs mb-2">{item.author}</p>
                      <p className="text-brand-600 font-semibold text-sm">Rs. {item.price.toLocaleString()}</p>
                      <button onClick={() => removeFromCart(item._id)} className="sm:hidden text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 mt-3 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-3 flex justify-between sm:justify-center items-center">
                    <span className="sm:hidden text-slate-500 text-sm font-semibold">Quantity:</span>
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden h-9 w-24 shadow-sm">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">-</button>
                      <div className="flex-1 text-center font-bold text-slate-800 text-sm border-x border-slate-200 select-none h-full flex items-center justify-center">{item.quantity}</div>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-3 flex justify-between sm:justify-end items-center">
                    <span className="sm:hidden text-slate-500 text-sm font-semibold">Total:</span>
                    <div className="flex items-center gap-4">
                      <p className="text-slate-800 font-bold tracking-wide">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      <button onClick={() => removeFromCart(item._id)} className="hidden sm:flex text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="text-slate-800 font-bold">Rs. {getCartTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Shipping Estimate</span>
                <span className="text-emerald-600 font-bold">Free</span>
              </div>
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                <span className="text-slate-800 font-bold">Order Total</span>
                <span className="text-2xl font-extrabold text-brand-600 tracking-wide">
                  Rs. {getCartTotal().toLocaleString()}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.3 3.9l-7.4 12.8A1.5 1.5 0 004.2 19h15.6a1.5 1.5 0 001.3-2.3L13.7 3.9a1.5 1.5 0 00-2.6 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full btn-primary h-14 text-lg flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : user ? (
                'Place Order'
              ) : (
                'Login to Checkout'
              )}
            </button>

            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-amber-700 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your order will require admin approval before payment.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure 256-bit AES Encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
