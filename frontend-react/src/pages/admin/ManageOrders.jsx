import { useState, useEffect } from 'react';
import { getAllOrders, approveOrder, cancelOrder, updateShipmentStatus } from '../../services/api';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await getAllOrders();
            setOrders(data.orders || []);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await approveOrder(id);
            await fetchOrders();
        } catch (err) {
            const baseMessage = err.response?.data?.message || err.message || 'Failed to approve order';
            const details = Array.isArray(err.response?.data?.errors)
                ? err.response.data.errors.join('\n')
                : '';
            alert(details ? `${baseMessage}\n\n${details}` : baseMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        setActionLoading(id);
        try {
            await cancelOrder(id);
            await fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleShipmentChange = async (id, status) => {
        setActionLoading(id);
        try {
            await updateShipmentStatus(id, { status });
            await fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending_approval':
                return 'bg-amber-50 text-amber-600 border border-amber-200';
            case 'approved':
                return 'bg-blue-50 text-blue-600 border border-blue-200';
            case 'shipped':
                return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
            case 'delivered':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
            case 'cancelled':
                return 'bg-red-50 text-red-600 border border-red-200';
            default:
                return 'bg-slate-50 text-slate-600 border border-slate-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending_approval':
                return 'Pending Approval';
            case 'approved':
                return 'Approved';
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

    const filteredOrders =
        filter === 'all' ? orders : orders.filter((o) => o.orderStatus === filter);

    const statusCounts = {
        all: orders.length,
        pending_approval: orders.filter((o) => o.orderStatus === 'pending_approval').length,
        approved: orders.filter((o) => o.orderStatus === 'approved').length,
        shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
        delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
        cancelled: orders.filter((o) => o.orderStatus === 'cancelled').length,
    };

    const filters = [
        { key: 'all', label: 'All Orders' },
        { key: 'pending_approval', label: 'Pending Approval' },
        { key: 'approved', label: 'Approved' },
        { key: 'shipped', label: 'Shipped' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 px-2">
                <h1 className="text-3xl font-bold text-slate-800 mb-1 border-l-4 border-brand-600 pl-4 -ml-4">
                    Manage Orders
                </h1>
                <p className="text-slate-500 text-sm">Review, approve, and manage customer orders.</p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.key
                                ? 'bg-brand-600 text-white shadow-md'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {f.label}
                        {statusCounts[f.key] > 0 && (
                            <span
                                className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${filter === f.key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                            >
                                {statusCounts[f.key]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                    <h3 className="text-xl text-slate-800 font-bold mb-2">No orders found</h3>
                    <p className="text-slate-500">
                        {filter === 'all'
                            ? 'No orders have been placed yet.'
                            : `No orders with status "${getStatusLabel(filter)}".`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-brand-300 transition-colors"
                        >
                            {/* Order Header */}
                            <div className="bg-slate-50 p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                            Order ID
                                        </p>
                                        <p className="text-brand-600 font-mono text-sm font-bold">
                                            {order._id?.slice(-8) || order._id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                            Date
                                        </p>
                                        <p className="text-slate-800 font-semibold text-sm">
                                            {new Date(order.createdAt).toLocaleDateString()}{' '}
                                            {new Date(order.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                            Customer
                                        </p>
                                        <p className="text-slate-800 font-semibold text-sm">
                                            {order.userName || 'N/A'}
                                            {order.userEmail && (
                                                <span className="text-slate-400 text-xs ml-1">({order.userEmail})</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(
                                            order.orderStatus
                                        )}`}
                                    >
                                        {getStatusLabel(order.orderStatus)}
                                    </span>
                                    <span className="text-xl font-black text-brand-600">
                                        Rs. {order.totalPrice?.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-4 sm:px-6">
                                <div className="space-y-2">
                                    {order.items?.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-center text-sm border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-10 h-14 object-cover rounded border border-slate-200"
                                                    />
                                                )}
                                                <div>
                                                    <span className="text-slate-700 font-semibold">{item.title}</span>
                                                    {item.author && (
                                                        <span className="text-slate-400 text-xs ml-2">by {item.author}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-slate-600 font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs">
                                                    {item.quantity}x
                                                </span>
                                                <span className="text-slate-700 font-bold">
                                                    Rs. {(item.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Actions */}
                            {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                                <div className="bg-slate-50 p-4 sm:px-6 border-t border-slate-200 flex flex-wrap items-center gap-3">
                                    {order.orderStatus === 'pending_approval' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(order._id)}
                                                disabled={actionLoading === order._id}
                                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
                                            >
                                                {actionLoading === order._id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                                Approve Order
                                            </button>
                                            <button
                                                onClick={() => handleCancel(order._id)}
                                                disabled={actionLoading === order._id}
                                                className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 shadow-sm"
                                            >
                                                Cancel Order
                                            </button>
                                        </>
                                    )}

                                    {(order.orderStatus === 'approved' || order.orderStatus === 'shipped') && (
                                        <>
                                            {order.orderStatus === 'approved' && (
                                                <button
                                                    onClick={() => handleShipmentChange(order._id, 'shipped')}
                                                    disabled={actionLoading === order._id}
                                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
                                                >
                                                    {actionLoading === order._id ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                                                        </svg>
                                                    )}
                                                    Mark as Shipped
                                                </button>
                                            )}
                                            {order.orderStatus === 'shipped' && (
                                                <button
                                                    onClick={() => handleShipmentChange(order._id, 'delivered')}
                                                    disabled={actionLoading === order._id}
                                                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
                                                >
                                                    {actionLoading === order._id ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                    Mark as Delivered
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleCancel(order._id)}
                                                disabled={actionLoading === order._id}
                                                className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 shadow-sm"
                                            >
                                                Cancel Order
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
