import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyOrders } from '../../services/api';

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await getMyOrders();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'approved':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'Pending Approval';
      case 'approved':
        return 'Approved – Awaiting Payment';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'Your order is being reviewed by our team. You will be notified once approved.';
      case 'approved':
        return 'Your order has been approved. Complete checkout to continue processing.';
      case 'shipped':
        return 'Your order is on its way! Check back for delivery updates.';
      case 'delivered':
        return 'Your order has been delivered. Enjoy your books!';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2 border-l-4 border-brand-600 pl-4">My Orders</h1>
      <p className="text-slate-500 mb-8 pl-5">Track your orders and see their current status.</p>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl text-slate-800 font-bold mb-2">No orders found</h3>
          <p className="text-slate-500 mb-6 font-medium">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-brand-300 transition-colors shadow-sm">
              <div className="bg-slate-50 p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Order Placed</p>
                  <p className="text-slate-800 font-bold">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 sm:text-right">Order Number</p>
                  <p className="text-brand-600 font-mono text-sm font-bold">{order._id?.slice(-8) || order._id}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${getStatusColor(order.orderStatus)}`}>
                    {getStatusLabel(order.orderStatus)}
                  </span>
                </div>
              </div>

              {/* Status message */}
              {getStatusDescription(order.orderStatus) && (
                <div className={`px-4 sm:px-6 py-3 text-sm font-medium border-b border-slate-100 ${order.orderStatus === 'approved' ? 'bg-blue-50 text-blue-700' :
                    order.orderStatus === 'pending_approval' ? 'bg-amber-50 text-amber-700' :
                      order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-slate-50 text-slate-600'
                  }`}>
                  <div className="flex items-center gap-2">
                    {order.orderStatus === 'pending_approval' && (
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {order.orderStatus === 'approved' && (
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {getStatusDescription(order.orderStatus)}
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-6 space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-4">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-10 h-14 object-cover rounded border border-slate-200" />
                      )}
                      <div>
                        <span className="text-slate-700 font-semibold">{item.title}</span>
                        {item.author && <span className="text-slate-400 text-xs ml-2">by {item.author}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">{item.quantity}x</span>
                      <span className="text-slate-600 font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-4 sm:px-6 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-bold uppercase tracking-wider text-sm">Total Amount</span>
                <div className="flex items-center gap-3">
                  {order.orderStatus === 'approved' && (
                    <Link
                      to={`/dashboard/orders/${order._id}/checkout`}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
                    >
                      Checkout
                    </Link>
                  )}
                  <span className="text-2xl font-black text-brand-600 tracking-wide">Rs. {order.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
