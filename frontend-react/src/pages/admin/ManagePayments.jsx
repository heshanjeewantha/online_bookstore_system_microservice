import { useEffect, useMemo, useState } from 'react';
import { getAllPayments } from '../../services/api';

const statusBadgeClasses = {
  paid: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  failed: 'bg-red-50 text-red-600 border-red-200',
  refunded: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

const normalizeStatus = (status = '') => status.toLowerCase();

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const { data } = await getAllPayments();
        setPayments(data.payments || []);
      } catch (err) {
        console.error('Failed to fetch payments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    if (filter === 'all') return payments;
    return payments.filter((payment) => normalizeStatus(payment.paymentStatus) === filter);
  }, [payments, filter]);

  const counts = useMemo(() => ({
    all: payments.length,
    paid: payments.filter((payment) => normalizeStatus(payment.paymentStatus) === 'paid').length,
    pending: payments.filter((payment) => normalizeStatus(payment.paymentStatus) === 'pending').length,
    failed: payments.filter((payment) => normalizeStatus(payment.paymentStatus) === 'failed').length,
    refunded: payments.filter((payment) => normalizeStatus(payment.paymentStatus) === 'refunded').length,
  }), [payments]);

  const filters = [
    { key: 'all', label: 'All Payments' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
    { key: 'refunded', label: 'Refunded' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 px-2">
        <h1 className="text-3xl font-bold text-slate-800 mb-1 border-l-4 border-brand-600 pl-4 -ml-4">
          Manage Payments
        </h1>
        <p className="text-slate-500 text-sm">View all payment transactions across customer orders.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === item.key
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.label}
            {counts[item.key] > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  filter === item.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {counts[item.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
          <h3 className="text-xl text-slate-800 font-bold mb-2">No payments found</h3>
          <p className="text-slate-500">
            {filter === 'all' ? 'There are no payment records yet.' : `No "${filter}" payments found.`}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => {
                const status = normalizeStatus(payment.paymentStatus);
                return (
                  <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-semibold">{payment.transactionId || '-'}</p>
                      <p className="text-slate-400 text-xs font-mono">{payment._id}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">{payment.orderId}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">{payment.userId}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {payment.currency || 'LKR'} {Number(payment.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 capitalize">{(payment.paymentMethod || '').replaceAll('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadgeClasses[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagePayments;
