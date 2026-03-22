import React, { useState } from 'react';
import { orderService } from '../../api/services/orderService';
import { paymentService } from '../../api/services/paymentService';

const Checkout = ({ items = [], totalAmount = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // If no items are passed, mock some data for the example to show properly
  const cartItems = items.length ? items : [{ id: 1, title: 'Sample Book', quantity: 1, price: 29.99 }];
  const checkoutTotal = totalAmount > 0 ? totalAmount : 29.99;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create order in Order Service
      const orderData = { items: cartItems, totalAmount: checkoutTotal };
      const order = await orderService.createOrder(orderData);
      
      // 2. Process payment in Payment Service
      const paymentData = {
        orderId: order.id || order._id || 'TEMP_ID_' + Date.now(),
        amount: checkoutTotal,
        paymentMethod: 'CreditCard'
      };
      await paymentService.processPayment(paymentData);
      
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Checkout failed'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 text-green-800 rounded-lg mx-auto max-w-md mt-8 text-center shadow-sm">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        <h3 className="font-bold text-2xl mb-2">Payment Successful!</h3>
        <p className="text-green-700 text-sm">Your order has been placed and is being processed.</p>
        <button 
          className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={() => setSuccess(false)}
        >
          Place Another Order
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg shadow-md max-w-md mx-auto mt-8 bg-white">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-800">Checkout</h2>
      
      <div className="mb-6 bg-gray-50 p-4 rounded border">
        <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Order Summary</h4>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Total Items:</span>
          <span className="font-medium text-gray-900">{cartItems.length}</span>
        </div>
        <div className="flex justify-between items-center border-t pt-2 mt-2">
          <span className="text-gray-700 font-bold">Total Amount:</span>
          <span className="text-xl font-extrabold text-blue-600">${checkoutTotal.toFixed(2)}</span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={handleCheckout}
        disabled={loading || cartItems.length === 0}
        className="bg-green-600 text-white font-bold py-3 px-4 rounded hover:bg-green-700 w-full disabled:opacity-50 transition-colors shadow-sm"
      >
        {loading ? 'Processing Payment...' : `Pay $${checkoutTotal.toFixed(2)}`}
      </button>
    </div>
  );
};

export default Checkout;
