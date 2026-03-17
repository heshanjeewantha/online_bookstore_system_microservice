import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../mocks/orders';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetchOrders();
  }, []);

  const fetchOrders = async () => {
      setLoading(true);
      try {
          const { data } = await getOrders();
          setOrders(data);
      } finally { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
      try {
          await updateOrderStatus(id, newStatus);
          await fetchOrders();
      } catch (err) { alert(err.message); }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'pending': return 'bg-amber-50 text-amber-600 border border-amber-200';
          case 'processing': return 'bg-blue-50 text-blue-600 border border-blue-200';
          case 'shipped': return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
          case 'delivered': return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
          case 'cancelled': return 'bg-red-50 text-red-600 border border-red-200';
          default: return 'bg-slate-50 text-slate-600 border border-slate-200';
      }
  };

  return (
    <div className="max-w-7xl mx-auto">
       <div className="mb-8 px-2">
           <h1 className="text-3xl font-bold text-slate-800 mb-1 border-l-4 border-brand-600 pl-4 -ml-4">Manage Orders</h1>
           <p className="text-slate-500 text-sm">View and update customer order statuses.</p>
       </div>

       {loading ? (
             <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
       ) : (
           <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                   <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                       <tr>
                           <th className="px-6 py-4">Order ID & Date</th>
                           <th className="px-6 py-4">Customer ID</th>
                           <th className="px-6 py-4">Items</th>
                           <th className="px-6 py-4">Total Amount</th>
                           <th className="px-6 py-4">Current Status</th>
                           <th className="px-6 py-4">Update Status</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                       {orders.map(order => (
                           <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-4">
                                   <p className="text-brand-600 font-mono text-sm font-bold mb-0.5">{order._id}</p>
                                   <p className="text-xs text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                               </td>
                               <td className="px-6 py-4 font-mono text-xs">{order.userId}</td>
                               <td className="px-6 py-4">
                                   <div className="max-w-[200px] truncate font-medium text-slate-700" title={order.items.map(i=>`${i.quantity}x ${i.title}`).join(', ')}>
                                      {order.items.length} items <span className="text-slate-400 text-xs">({order.items.reduce((sum, i) => sum+i.quantity, 0)} total)</span>
                                   </div>
                               </td>
                               <td className="px-6 py-4 font-bold text-slate-800">Rs. {order.totalPrice.toLocaleString()}</td>
                               <td className="px-6 py-4">
                                   <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(order.orderStatus)}`}>
                                       {order.orderStatus}
                                   </span>
                               </td>
                               <td className="px-6 py-4">
                                   <select 
                                      value={order.orderStatus}
                                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                      className="bg-white border border-slate-300 text-slate-700 font-medium text-xs rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2 shadow-sm"
                                   >
                                      <option value="pending">Pending</option>
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="cancelled">Cancelled</option>
                                   </select>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       )}
    </div>
  );
};

export default ManageOrders;
