import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
// PaymentPage is no longer used — checkout and order creation
// now happen directly on the CartPage via the order-service API.

const PaymentPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, navigate, success]);

  const handleConfirmPayment = async () => {
    if (!user || cartItems.length === 0) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const itemsPayload = cartItems.map((item) => ({
        bookId: item._id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        stock: item.stock,
      }));

      await createOrder(user._id, itemsPayload);

      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
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
        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Payment Successful!</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Thank you for shopping at PothaGedara.lk. Your payment has been processed and your books will be shipped soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/dashboard/orders" className="btn-primary">View My Orders</Link>
          <Link to="/" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/cart" className="text-brand-600 hover:text-brand-700 font-bold mb-8 flex items-center gap-2">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold text-slate-800 mb-8 border-l-4 border-brand-600 pl-4">Checkout and Payment</h1>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">Payment Summary</h2>

        <div className="space-y-4 mb-6">
          {cartItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">{item.quantity}x</span>
                <span className="text-slate-700 font-medium">{item.title}</span>
              </div>
              <span className="text-slate-600 font-semibold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-4 mb-6 flex justify-between items-center">
          <span className="text-slate-800 font-bold text-lg">Total Amount</span>
          <span className="text-3xl font-extrabold text-brand-600">Rs. {getCartTotal().toLocaleString()}</span>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.3 3.9l-7.4 12.8A1.5 1.5 0 004.2 19h15.6a1.5 1.5 0 001.3-2.3L13.7 3.9a1.5 1.5 0 00-2.6 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6">
          <p className="text-slate-500 text-xs mb-3 font-semibold uppercase tracking-wider">Payment Method (Mock)</p>
          <div className="flex items-center gap-3 bg-white border border-slate-300 p-3 rounded-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18" />
              </svg>
            </div>
            <div>
              <p className="text-slate-800 font-semibold text-sm">Credit / Debit Card</p>
              <p className="text-slate-500 text-xs text-brand-500">**** **** **** 4242</p>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-3 italic">
            Note: This is a simulated transaction. No real money will be charged.
          </p>
        </div>

        <button
          onClick={handleConfirmPayment}
          disabled={processing}
          className="w-full btn-primary h-14 text-lg flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>Confirm and Pay Rs. {getCartTotal().toLocaleString()}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
