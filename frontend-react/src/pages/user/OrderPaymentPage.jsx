import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getOrderById, getPaymentsByUser, processPayment } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const cardNumberDigits = (value) => value.replace(/\D/g, '').slice(0, 16);

const formatCardNumber = (value) => {
  const digits = cardNumberDigits(value);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const luhnCheck = (digits) => {
  let sum = 0;
  let doubleDigit = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let current = Number(digits[i]);
    if (doubleDigit) {
      current *= 2;
      if (current > 9) current -= 9;
    }
    sum += current;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
};

const validateCheckoutForm = (form) => {
  const errors = {};
  const cardName = form.cardName.trim();
  const numberDigits = cardNumberDigits(form.cardNumber);
  const cvvDigits = form.cvv.replace(/\D/g, '');
  const expiryValue = form.expiry.trim();

  if (!cardName) {
    errors.cardName = 'Cardholder name is required.';
  } else if (cardName.length < 2) {
    errors.cardName = 'Cardholder name is too short.';
  }

  if (numberDigits.length !== 16) {
    errors.cardNumber = 'Card number must be 16 digits.';
  } else if (!luhnCheck(numberDigits)) {
    errors.cardNumber = 'Invalid card number.';
  }

  if (!/^\d{2}\/\d{2}$/.test(expiryValue)) {
    errors.expiry = 'Expiry must be in MM/YY format.';
  } else {
    const [monthStr, yearStr] = expiryValue.split('/');
    const month = Number(monthStr);
    const year = Number(`20${yearStr}`);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (month < 1 || month > 12) {
      errors.expiry = 'Expiry month must be between 01 and 12.';
    } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.expiry = 'Card has expired.';
    }
  }

  if (!/^\d{3,4}$/.test(cvvDigits)) {
    errors.cvv = 'CVV must be 3 or 4 digits.';
  }

  return errors;
};

const OrderPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
    // Prominent error/success banners
    const renderPaymentBanner = () => (
      <>
        {error && (
          <div className="flex items-center gap-3 px-6 py-4 mb-6 text-red-900 border-2 border-red-500 rounded-lg shadow-lg bg-red-50 animate-pulse">
            <svg className="flex-shrink-0 w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
            <span className="text-base font-bold">{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-3 px-6 py-4 mb-6 text-green-900 border-2 border-green-500 rounded-lg shadow-lg bg-green-50 animate-pulse">
            <svg className="flex-shrink-0 w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span className="text-base font-bold">{successMessage}</span>
          </div>
        )}
      </>
    );
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [form, setForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const canPay = useMemo(() => {
    if (!order) return false;
    return order.orderStatus === 'approved' && !alreadyPaid;
  }, [order, alreadyPaid]);

  useEffect(() => {
    const fetchOrderAndPaymentState = async () => {
      try {
        const [{ data: orderData }, { data: paymentsData }] = await Promise.all([
          getOrderById(id),
          getPaymentsByUser(user._id),
        ]);

        const fetchedOrder = orderData.order;
        setOrder(fetchedOrder);

        const userPayments = paymentsData.payments || [];
        const paidForOrder = userPayments.some(
          (payment) => payment.orderId === fetchedOrder._id && payment.paymentStatus === 'paid'
        );
        setAlreadyPaid(paidForOrder);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order payment details.');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchOrderAndPaymentState();
    }
  }, [id, user]);

  const handleFieldChange = (field, value) => {
    let nextValue = value;

    if (field === 'cardNumber') {
      nextValue = formatCardNumber(value);
    }

    if (field === 'expiry') {
      nextValue = formatExpiry(value);
    }

    if (field === 'cvv') {
      nextValue = value.replace(/\D/g, '').slice(0, 4);
    }

    const nextForm = { ...form, [field]: nextValue };
    setForm(nextForm);

    const validationErrors = validateCheckoutForm(nextForm);
    setFormErrors(validationErrors);
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormErrors(validateCheckoutForm(form));
  };

  const handlePayNow = async () => {
    if (!order || !user || !canPay) return;

    const validationErrors = validateCheckoutForm(form);
    setFormErrors(validationErrors);
    setTouched({ cardName: true, cardNumber: true, expiry: true, cvv: true });

    if (Object.keys(validationErrors).length > 0) {
      setError('Please correct card details before checkout.');
      return;
    }
    try {
      await processPayment({
        orderId: order._id,
        userId: user._id,
        amount: order.totalPrice,
        paymentMethod: 'card',
        currency: 'LKR',
      });

      setAlreadyPaid(true);
      setSuccessMessage('Payment successful. Your order is now ready for shipment processing.');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 rounded-full border-brand-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl p-8 mx-auto text-center bg-white border border-slate-200 rounded-2xl">
        <p className="font-medium text-slate-600">Order not found.</p>
        <Link to="/dashboard/orders" className="inline-block mt-5 btn-primary">Back to My Orders</Link>
      </div>
    );
  }

  const isFormValid = Object.keys(validateCheckoutForm(form)).length === 0;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/dashboard/orders" className="inline-flex items-center gap-2 mb-6 font-bold text-brand-600 hover:text-brand-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to My Orders
      </Link>

      <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-2xl">
        <div className="p-5 border-b bg-slate-50 border-slate-200 sm:p-6">
          <h1 className="text-2xl font-bold text-slate-800">Checkout</h1>
          <p className="mt-1 text-sm text-slate-500">Order #{order._id?.slice(-8) || order._id}</p>
        </div>

        <div className="p-5 space-y-5 sm:p-6">
          <div className="p-4 border rounded-xl border-slate-200 bg-slate-50">
            <p className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Order Status</p>
            <p className="font-semibold text-slate-800">
              {order.orderStatus === 'approved' ? 'Approved - Ready for payment' : `Current status: ${order.orderStatus}`}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Items</p>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <span className="text-sm text-slate-700">{item.title} x {item.quantity}</span>
                  <span className="text-sm font-semibold text-slate-700">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="font-bold text-slate-700">Total Amount</span>
            <span className="text-2xl font-black text-brand-600">Rs. {order.totalPrice?.toLocaleString()}</span>
          </div>

          <div className="p-4 space-y-4 border rounded-xl border-slate-200 bg-slate-50 sm:p-5">
            <p className="text-xs font-bold tracking-wider uppercase text-slate-500">Credit / Debit Card</p>

            <div>
              <label htmlFor="cardName" className="label">Cardholder Name</label>
              <input
                id="cardName"
                name="cardName"
                type="text"
                placeholder="Name on card"
                value={form.cardName}
                onChange={(event) => handleFieldChange('cardName', event.target.value)}
                onBlur={() => handleFieldBlur('cardName')}
                className="input-field"
              />
              {touched.cardName && formErrors.cardName && (
                <p className="mt-1 text-xs text-red-600">{formErrors.cardName}</p>
              )}
            </div>

            <div>
              <label htmlFor="cardNumber" className="label">Card Number</label>
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 5678 9012 3456"
                value={form.cardNumber}
                onChange={(event) => handleFieldChange('cardNumber', event.target.value)}
                onBlur={() => handleFieldBlur('cardNumber')}
                className="input-field"
              />
              {touched.cardNumber && formErrors.cardNumber && (
                <p className="mt-1 text-xs text-red-600">{formErrors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="expiry" className="label">Expiry (MM/YY)</label>
                <input
                  id="expiry"
                  name="expiry"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={(event) => handleFieldChange('expiry', event.target.value)}
                  onBlur={() => handleFieldBlur('expiry')}
                  className="input-field"
                />
                {touched.expiry && formErrors.expiry && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.expiry}</p>
                )}
              </div>

              <div>
                <label htmlFor="cvv" className="label">CVV</label>
                <input
                  id="cvv"
                  name="cvv"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={form.cvv}
                  onChange={(event) => handleFieldChange('cvv', event.target.value)}
                  onBlur={() => handleFieldBlur('cvv')}
                  className="input-field"
                />
                {touched.cvv && formErrors.cvv && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.cvv}</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="px-4 py-3 text-sm border rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700">
              {successMessage}
            </div>
          )}

          {alreadyPaid && (
            <div className="px-4 py-3 text-sm border rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700">
              This order is already paid.
            </div>
          )}

          {!alreadyPaid && order.orderStatus !== 'approved' && (
            <div className="px-4 py-3 text-sm border rounded-xl border-amber-200 bg-amber-50 text-amber-700">
              Payment is available only after admin approval.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handlePayNow}
              disabled={!canPay || processing || !isFormValid}
              className="h-12 px-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : `Checkout Rs. ${order.totalPrice?.toLocaleString()}`}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/orders')}
              className="h-12 px-6 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentPage;

