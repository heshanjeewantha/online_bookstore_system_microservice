import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrdersByUser } from '../../mocks/orders';

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
         const { data } = await getOrdersByUser(user._id);
         setOrders(data);
      } catch (err) {
         console.error("Failed to fetch orders", err);
      } finally {
         setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
      switch(status) {
          case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
          case 'processing': return 'bg-blue-50 text-blue-600 border-blue-200';
          case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
          case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
          case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
          default: return 'bg-slate-50 text-slate-600 border-slate-200';
      }
  };

  if (loading) {
     return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2 border-l-4 border-brand-600 pl-4">Order History</h1>
      <p className="text-slate-500 mb-8 pl-5">View and track your past orders.</p>

      {orders.length === 0 ? (
         <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <span className="text-5xl mb-4 block text-slate-300">📦</span>
            <h3 className="text-xl text-slate-800 font-bold mb-2">No orders found</h3>
            <p className="text-slate-500 mb-6 font-medium">You haven't placed any orders yet.</p>
         </div>
      ) : (
         <div className="space-y-6">
            {orders.map(order => (
               <div key={order._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-brand-300 transition-colors shadow-sm">
                  {/* Header */}
                  <div className="bg-slate-50 p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Order Placed</p>
                          <p className="text-slate-800 font-bold">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 sm:text-right">Order Number</p>
                          <p className="text-brand-600 font-mono text-sm font-bold">{order._id}</p>
                      </div>
                      <div className="sm:text-right">
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Status</p>
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border shadow-sm capitalize ${getStatusColor(order.orderStatus)}`}>
                             {order.orderStatus}
                          </span>
                      </div>
                  </div>
                  
                  {/* Items */}
                  <div className="p-4 sm:p-6 space-y-4">
                      {order.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                             <div className="flex items-center gap-4">
                                <span className="text-slate-600 font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">{item.quantity}x</span>
                                <span className="text-slate-700 font-semibold">{item.title}</span>
                             </div>
                             <span className="text-slate-600 font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                         </div>
                      ))}
                  </div>
                  
                  {/* Footer */}
                  <div className="bg-slate-50 p-4 sm:px-6 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-slate-600 font-bold uppercase tracking-wider text-sm">Total Amount</span>
                      <span className="text-2xl font-black text-brand-600 tracking-wide">Rs. {order.totalPrice.toLocaleString()}</span>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};

export default UserOrders;
