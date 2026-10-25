import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { orderAPI } from '../../services/api';
import { Sidebar } from '../../components/common/Sidebar';

export const AdminPaymentsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI
      .getAllOrders()
      .then((res: any) => {
        if (Array.isArray(res)) setOrders(res as unknown as Order[]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Payment Transactions Log</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit log of simulated online payments (Card, UPI) and cash settlements.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading payment records...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No payment records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Transaction ID</th>
                    <th className="pb-3 px-2">Order #</th>
                    <th className="pb-3 px-2">Customer</th>
                    <th className="pb-3 px-2">Payment Method</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => {
                    const orderId = o._id || o.id || '';
                    const customerObj = typeof o.customer === 'object' ? o.customer : null;
                    const customerName = customerObj?.name || 'Customer';

                    const paymentObj = typeof o.payment === 'object' ? o.payment : null;
                    const txnId = paymentObj?.transactionId || `TXN-${o.orderNumber}`;
                    const method = paymentObj?.method || 'SIMULATED';
                    const status = paymentObj?.status || o.paymentStatus;

                    return (
                      <tr key={orderId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2 font-mono font-bold text-slate-700">
                          {txnId}
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-900">#{o.orderNumber}</td>
                        <td className="py-3 px-2 font-medium text-slate-800">{customerName}</td>
                        <td className="py-3 px-2">
                          <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {method}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-black text-orange-600">₹{o.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                              status === 'PAID' || status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-500">
                          {new Date(o.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
